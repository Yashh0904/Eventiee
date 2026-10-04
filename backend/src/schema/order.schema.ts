import z from "zod";

const orderItemSchema = z.object({
  ticketTypeId: z.uuid("Invalid ticket type ID"),
  quantity: z.number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
});

export const orderCreationSchema = z.object({
  eventId: z.uuid("Invalid event ID"),
  items: z.array(orderItemSchema)
    .nonempty("You must select at least one ticket")
});