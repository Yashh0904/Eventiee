import z from "zod";

export const env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  PAYMENT_SERVICE_SECRET: z.string().min(32),
  FRONTEND_URL: z.url(),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
}).parse(process.env);
