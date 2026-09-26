import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { eventSchema } from "./event.js";
import { ticketTypeSchema } from "./ticketType.js";
import { userSchema } from "./user.js";
import { orderSchema } from "./order.js";

export const ticketStatusEnum = pgEnum("ticket_status", ["VALID", "USED", "CANCELLED"])

export const ticketSchema = pgTable("ticket", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  attendeeId: uuid("attendee_id")
    .notNull()
    .references(() => userSchema.id, {
      onUpdate: "cascade"
    }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventSchema.id, {
      onUpdate: "cascade",
    }),
  ticketTypeId: uuid("ticket_type_id")
    .notNull()
    .references(() => ticketTypeSchema.id, {
      onUpdate: "cascade",
    }),
  orderId: uuid("order_id")
      .notNull()
      .references(() => orderSchema.id),
  shortId: integer("short_id")
    .notNull(),
  status: ticketStatusEnum("status")
    .notNull(),
  qrToken: text("qr_token").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true, mode:"date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
});