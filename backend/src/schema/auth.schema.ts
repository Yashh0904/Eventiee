import z from "zod";

export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Enter valid email").trim(),
  password: z.string().min(6, "Password needs to be at least 6 characters"),
  role: z.enum(["ORGANIZER", "ATTENDEE"])
});

export const userLoginSchema = z.object({
  email: z.email().trim(),
  password: z.string(),
});
