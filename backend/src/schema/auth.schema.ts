import z, { toLowerCase } from "zod";

export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 6 characters").max(72),
});

export const userLoginSchema = z.object({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required").max(72)
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  avatarUrl: z.string().url("Invalid avatar URL").trim().optional().nullable(),
}).refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
  message: "At least one field (name or avatarUrl) must be provided"
});
