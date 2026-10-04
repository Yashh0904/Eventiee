import z from "zod";

export const eventCreationSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").trim(),
  venue: z.string().min(1, "Venue is required").trim(),
  description: z.string().min(5, "Description must be at least 5 characters").trim(),
  dateTime: z.coerce.date("A valid event date and time is required")
});