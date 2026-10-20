import z from "zod";

export const ticketSchema = z.object({
  name: z.string().min(1, "Ticket tier name needed").trim(),
  price: z.coerce
    .number()
    .int("Price must be a whole integer")
    .nonnegative("Price cannot be negative"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole integer")
    .positive("Quantity must be at least 1")
});