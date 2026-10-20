import type { Request, Response } from "express";
import z from "zod";
import argon2 from "argon2";
import crypto from "node:crypto";
import { userLoginSchema, userRegistrationSchema } from "../schema/auth.schema.js";
import { db } from "../db/index.js";
import { refreshTokenSchema, userSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { createAccessToken, createRefreshToken } from "../services/authTokens.service.js";
import { redis } from "../lib/redis.js";

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

    await db
      .update(refreshTokenSchema)
      .set({ status: "EXPIRED" })
      .where(eq(refreshTokenSchema.id, token.id));

    const [ user ] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, token.userId));

    if(!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = createAccessToken( user.id, user.role);

    const newRefreshToken = createRefreshToken( user.id, user.role);

    const tokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

      const expiresAt = new Date(Date.now() + 7 * 24 * 60  * 60 * 1000);

    await db
    .insert(refreshTokenSchema)
    .values({
      userId: user.id,
      familyId: token.familyId,
      tokenHash,
      expiresAt
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

export const userLogout = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const accessToken = req.token!;
    const expiry = req.tokenExp;

    const remainingTime = expiry ? Math.max(0, Math.floor(expiry - Date.now()/1000)) : 15 * 60;

    const accessTokenHash = crypto
      .createHash('sha256')
      .update(accessToken)
      .digest('hex');

    if (remainingTime > 0) {
      await redis.set(`blacklist:${accessTokenHash}`, "1", "EX", remainingTime);
    }


    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      await db
        .update(refreshTokenSchema)
        .set({ status: "EXPIRED" })
        .where(eq(refreshTokenSchema.tokenHash, tokenHash));

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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