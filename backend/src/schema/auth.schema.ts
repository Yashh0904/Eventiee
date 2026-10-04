import z from "zod";

export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Please enter a valid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ORGANIZER", "ATTENDEE"], {
    error: "Role must be either ORGANIZER or ATTENDEE"
  })
});

export const userLoginSchema = z.object({
  email: z.email("Please enter a valid email address").trim(),
  password: z.string().min(1, "Password is required")
});
