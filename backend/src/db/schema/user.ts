import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["USER", "ADMIN"]);

export const userSchema = pgTable("user", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  name: varchar("name", { length: 255 })
    .notNull(),
  email: varchar("email", { length: 255 })
    .unique()
    .notNull(),
  passwordHash: varchar("password_hash", { length: 255 })
    .notNull(),
  role: userRole("role")
    .notNull()
    .default("USER"),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
});