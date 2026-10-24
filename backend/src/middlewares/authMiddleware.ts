import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { db } from "../db/index.js";
import { userSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../lib/redis.js";
import { env } from "../config/env.js";

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if(!accessToken) {
    return res.status(401).json({
      accessTokenPresent: false
    })
  }

  try {
    const decodedUser = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as JwtPayload;

    const tokenHash = crypto.createHash("sha-256").update(accessToken).digest("hex");
    const isRevoked = await redis.exists(`blacklist:${tokenHash}`);
    
    if(isRevoked) {
      return res.status(401).json({ 
        message: "Token has been revoked. Please log in again",
        tokenStatus: "REVOKED"
       });
    }

    const [ user ] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, decodedUser.userId))

    if(!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    req.user = user;
    req.token = accessToken;
    req.tokenExp = decodedUser.exp;

    next();
  } catch (error) {
    console.log(`ERROR: ${error}`);

    return res.status(401).json({
        message: "Invalid or expired token",
        tokenStatus: "EXPIRED"
    });
  }
}
