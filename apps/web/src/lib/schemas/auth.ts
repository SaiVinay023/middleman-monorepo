import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  role: z.enum(['company', 'freelancer']),
  /*password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),*/
  password: z.string().min(8, "Password must be at least 8 characters"),
});


export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});