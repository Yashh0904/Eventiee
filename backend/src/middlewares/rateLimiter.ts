import type { NextFunction, Request, Response } from "express"
import { redis } from "../lib/redis.js";

export interface RateLimiterOptions {
  windowMs: number,
  max: number,
  prefix: string
}

export const createRateLimiter = (options: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try{
      const ip = req.ip;
      const key = `rate_limit:${options.prefix}:${ip}`;

      const requests = await redis.incr(key);

      if(requests === 1) {
        await redis.expire(key, Math.ceil(options.windowMs / 1000))
      } else {
        const ttl = await redis.ttl(key);

        if(ttl === -1) {
          await redis.expire(key, Math.ceil(options.windowMs / 1000));
        }
      }

      if(requests > options.max) {
        const secondsRemaining = await redis.ttl(key);

        return res.status(429).json({
          message: "Too many requests",
          retryAfter: secondsRemaining
        })
      }
    } catch (error) {
      console.log("Rate limiter down:", error)
    }
    next();
  }
}

export const registerLimiter = createRateLimiter({windowMs: 60 * 60 * 1000, max: 4, prefix: "register"});

export const loginLimiter = createRateLimiter({windowMs: 60 * 1000, max: 10, prefix: "login"});

export const refreshLimiter = createRateLimiter({windowMs: 60 * 1000, max: 50, prefix: "refresh"});

export const orderLimiter = createRateLimiter({windowMs: 60 * 1000, max: 5, prefix: "order"});

export const checkInLimiter = createRateLimiter({windowMs: 60 * 1000, max: 60, prefix: "check-in"});