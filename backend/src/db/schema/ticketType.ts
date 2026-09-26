import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { eventSchema } from "./event.js";

export const ticketTypeSchema = pgTable("ticketType", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventSchema.id, {
      onUpdate: "cascade",
      onDelete: "restrict"
    }),
  name: varchar("name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
});