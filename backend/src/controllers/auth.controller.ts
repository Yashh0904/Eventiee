import type { Request, Response } from "express";
import z from "zod";
import argon2 from "argon2";
import crypto from "node:crypto";
import { updateProfileSchema, userLoginSchema, userRegistrationSchema } from "../schema/auth.schema.js";
import { db } from "../db/index.js";
import { refreshTokenSchema, userSchema } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { createAccessToken, createRefreshToken } from "../services/authTokens.service.js";
import { redis } from "../lib/redis.js";
import type { SafeUser } from "../types/express.js";
import { env } from "../config/env.js";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { emailQueue } from "../queues/email.queue.js";

type RefreshResult =
  | {
      kind: "success";
      accessToken: string;
      user: SafeUser;
      refreshToken: string;
    }
  | {
      kind: "replay";
    };

export const userRegistration = async (req: Request, res: Response) => {
  try{
     const result = userRegistrationSchema.safeParse(req.body);

    if(result.error) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors
      })
    }

    const { name, email, password } = result.data;

    const [ userExists ] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email));
    
    if(userExists) {
      return res.status(409).json({
        message: "Account with this email already exists"
      })
    }

    const passwordHash = await argon2.hash(password);

    const [ user ] = await db
      .insert(userSchema)
      .values({
        name,
        email,
        passwordHash,
      }).returning();

    if(!user){
      throw new Error("User creation failed")
    }

    const refreshToken = createRefreshToken(user.id, user.role);
    const accessToken = createAccessToken(user.id, user.role);

    const familyId = crypto.randomUUID();

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60  * 60 * 1000);
    
    await db
      .insert(refreshTokenSchema)
      .values({
        userId: user.id,
        familyId,
        tokenHash,
        expiresAt
      });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await emailQueue.add("send-email",
      { type: "welcome", userEmail: user.email, userName: user.name },
      {
        jobId: `welcome-email-${user.id}`,
        removeOnComplete: true,
        removeOnFail: 1000,
      }
    )

    return res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });    
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR"
    })
  }
}

export const userLogin = async (req: Request, res: Response) => {
  try{
    const result = userLoginSchema.safeParse(req.body);

    if(result.error) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors
      })
    }

    const { email, password} = result.data;

    const [ user ] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email));
    
    if(!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    const isPasswordCorrect = await argon2.verify( user.passwordHash, password);

    if(!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    const refreshToken = createRefreshToken( user.id, user.role);
    const accessToken = createAccessToken( user.id, user.role);

    const familyId = crypto.randomUUID();

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60  * 60 * 1000);
    
    await db
      .insert(refreshTokenSchema)
      .values({
        userId: user.id,
        familyId,
        tokenHash,
        expiresAt
      });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });    
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR"
    })
  }
}

export const tokenRefresh = async (req: Request, res: Response) => {
  try{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) {
      return res.status(400).json({
        activeSession: false,
        message: "No active session. Please login"
      })
    }

    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const [ token ] = await db
      .select()
      .from(refreshTokenSchema)
      .where(eq(refreshTokenSchema.tokenHash, hashedRefreshToken));

    if(!token){
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Invalid session" });
    }

    if (token.status !== "ACTIVE") {
      await db
        .update(refreshTokenSchema)
        .set({ status: "EXPIRED" })
        .where(eq(refreshTokenSchema.familyId, token.familyId));

      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Session compromised. Please log in again." });
    }

    if (token.expiresAt < new Date()) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    const txn = await db.transaction(async (tx) => {
      const [consumedToken] = await tx
      .update(refreshTokenSchema)
      .set({ status: "EXPIRED" })
      .where(and(
          eq(refreshTokenSchema.id, token.id),
          eq(refreshTokenSchema.status, "ACTIVE"))
      ).returning();

      if(!consumedToken) {
        return { kind: "replay" as const }
      }
      
      const [ user ] = await tx
      .select()
        .from(userSchema)
        .where(eq(userSchema.id, token.userId));
        
      if(!user) {
        throw new Error("Refresh token references a missing user");
      }

      const accessToken = createAccessToken( user.id, user.role);

      const newRefreshToken = createRefreshToken( user.id, user.role);

      const tokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');
      
      const expiresAt = new Date(Date.now() + 7 * 24 * 60  * 60 * 1000);
      
      await tx
      .insert(refreshTokenSchema)
      .values({
        userId: user.id,
        familyId: token.familyId,
        tokenHash,
        expiresAt
      });
      
      return {kind: "success" as const, accessToken, user, newRefreshToken}
    });
    
    if (txn.kind === "replay") {
      res.clearCookie("refreshToken");
      return res.status(403).json({
        message: "Session already used. Please log in again.",
      });
    }
    
    res.cookie("refreshToken", txn.newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(201).json({
      accessToken: txn.accessToken,
      user: { id: txn.user.id, name: txn.user.name, email: txn.user.email, role: txn.user.role },
    });  
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "INTERNAL SERVER ERROR"
    })
  }
}

export const userLogout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const refreshToken = req.cookies.refreshToken;
    
    if (accessToken) {
      const decoded = jwt.decode(accessToken) as JwtPayload | null;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      
      const remainingSeconds = decoded?.exp ? Math.max(0, decoded.exp - nowInSeconds) : 0;
      
      if (remainingSeconds > 0) {
        const accessTokenHash = crypto
          .createHash("sha256")
          .update(accessToken)
          .digest("hex");
        await redis.set(`blacklist:${accessTokenHash}`, "1", "EX", remainingSeconds);
      }
    }

    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      await db
        .update(refreshTokenSchema)
        .set({ status: "EXPIRED" })
        .where(eq(refreshTokenSchema.tokenHash, tokenHash));

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        path: '/api/auth',
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const [ currentUser ] = await db
      .select({
        id: userSchema.id,
        name: userSchema.name,
        email: userSchema.email,
        role: userSchema.role,
        avatarUrl: userSchema.avatarUrl,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema)
      .where(eq(userSchema.id, user.id));

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: currentUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = updateProfileSchema.safeParse(req.body);

    if (result.error) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors,
      });
    }

    const { name, avatarUrl } = result.data;

    const [ updatedUser ] = await db
      .update(userSchema)
      .set({
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(userSchema.id, user.id))
      .returning({
        id: userSchema.id,
        name: userSchema.name,
        email: userSchema.email,
        role: userSchema.role,
        avatarUrl: userSchema.avatarUrl,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};
