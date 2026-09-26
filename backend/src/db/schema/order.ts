import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./user.js";

export const orderStatusEnum = pgEnum("order_status", ["PENDING", "COMPLETED", "CANCELLED", "EXPIRED"]);

export const orderSchema = pgTable("order", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id),
  status: orderStatusEnum("status")
    .notNull(),
  totalAmount: integer("total_amount")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
})