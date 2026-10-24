import jwt from "jsonwebtoken"
import { env } from "../config/env.js";

export const createRefreshToken = ( userId: string, role: string ) => {
  const refreshToken = jwt.sign({ userId, role }, 
    env.REFRESH_TOKEN_SECRET, 
    { expiresIn: "7d" })

  return refreshToken;
}
export const createAccessToken = ( userId: string, role: string ) => {
  const accessToken = jwt.sign({ userId, role }, 
    env.ACCESS_TOKEN_SECRET, 
    { expiresIn: "15m" })

  return accessToken;
}
