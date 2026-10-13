import type { userSchema } from "../db/schema.ts";

type SafeUser = Omit<typeof userSchema.$inferSelect, "passwordHash">;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      token?: string;
      tokenExp?: number | undefined;
    }
  }
}