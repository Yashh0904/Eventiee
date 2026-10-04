import z from "zod";

export const ticketCreationSchema = z.object({
  name: z.string().min(3, "Ticket tier name must be at least 3 characters").trim(),
  price: z
    .number()
    .int("Price must be a whole integer")
    .nonnegative("Price cannot be negative"),
  quantity: z
    .number()
    .int("Quantity must be a whole integer")
    .positive("Quantity must be at least 1")
});