import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { orderSchema } from "./order.js";
import { ticketTypeSchema } from "./ticketType.js";

export const orderItemSchema = pgTable("order_item", {
  orderItemId: uuid("id")
    .defaultRandom()
    .primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orderSchema.id),
  ticketTypeId: uuid("ticket_type_id")
    .notNull()
    .references(() => ticketTypeSchema.id, {
      onUpdate: "cascade",
      onDelete: "restrict"
    }),
  quantity: integer("quantity")
    .notNull(),
  unitPrice: integer("unit_price")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
})