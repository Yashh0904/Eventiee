import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./user.js";

export const refreshTokenStatusEnum = pgEnum("token_status", ["ACTIVE", "EXPIRED"]);

export const refreshTokenSchema = pgTable("refresh_token", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash")
    .notNull(),
  familyId: uuid("family_id")
    .notNull(),
  status: refreshTokenStatusEnum("status")
    .notNull()
    .default("ACTIVE"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});
