import z from "zod";
import { ticketSchema } from "./ticket.schema.js";

export const eventCreationSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").trim(),
  venue: z.string().min(1, "Venue is required").trim(),
  city: z.string().min(1, "City is required"),
  description: z.string().min(5, "Description must be at least 5 characters").trim(),
  dateTime: z.coerce.date("A valid event date and time is required"),
  endDateTime: z.coerce.date().optional(),
  bannerUrl: z.string().trim().optional(),
  tickets: z.array(ticketSchema).min(1, "At least one ticket tier is required")
});