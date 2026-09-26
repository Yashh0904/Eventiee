import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { db } from "../db/index.js";
import { userSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if(!accessToken) {
    return res.send(401).json({
      accessTokenPresent: false
    })
  }

  try {
    const decodedUser = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

    const [ user ] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, decodedUser.id))

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