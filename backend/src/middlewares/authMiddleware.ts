import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { db } from "../db/index.js";
import { userSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if(!accessToken) {
    return res.status(401).json({
      accessTokenPresent: false
    })
  }

  try {
    const decodedUser = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

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

    next();
  } catch (error) {
    console.log(`ERROR: ${error}`);

    return res.status(401).json({
        message: "Invalid or expired token"
    });
  }
}

export const requireRole = (allowedRole: 'ORGANIZER' | 'ATTENDEE') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if(req.user.role !== allowedRole) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  }
}