import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { orderSchema } from "./order.js";

export const paymentStatusEnum = pgEnum("payment_status", ["SUCCESSFUL", "FAILED"])

export const paymentSchema = pgTable("payment", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orderSchema.id),
  name: varchar("name", { length: 255 }),
  amount: integer("amount")
    .notNull(),
  currency: varchar("currency", { length: 3})
    .notNull()
    .default("INR"),
  status: paymentStatusEnum("status").notNull(),
  provider: varchar("provider", { length: 255 })
    .notNull(),
  providerPaymentId: text("provider_payment_id")
    .notNull(),
  providerOrderId: text("provider_order_id")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
});