import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userSchema } from "./user.js";

export const eventSchema = pgTable("event", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => userSchema.id, {
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 })
    .notNull(),
  venue: varchar("venue", { length: 255 })
    .notNull(),
  city: varchar("city", { length: 100 })
    .notNull(),
  description: text('description').notNull(),
  dateTime: timestamp("date_time", { withTimezone: true })
    .notNull(),
  endDateTime: timestamp("end_date_time", { withTimezone: true, mode: "date" }),
  bannerUrl: varchar("banner_url", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode:"date" })
    .defaultNow()
    .notNull(),
});