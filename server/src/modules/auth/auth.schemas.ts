import { z } from "zod";

// ----------------------------------------------------------------------------
// Register input — validated on every POST /auth/register request.
// Role is restricted to STUDENT or INSTRUCTOR — clients can never self-assign
// ADMIN. This matches an open marketplace model (like Udemy): anyone can
// register as an instructor immediately, but nothing they create is visible
// to students until they explicitly publish a course (see courses.service.ts
// publishCourse — courses default to DRAFT). Content-level gating replaces
// account-level gating as the trust/safety boundary.
// ----------------------------------------------------------------------------
export const registerSchema = z.object({
  email: z
    .string()
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim(),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

// ----------------------------------------------------------------------------
// Login input
// ----------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Must be a valid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid("Invalid reset token"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

// ----------------------------------------------------------------------------
// Inferred TypeScript types from the schemas — used in service/controller.
// ----------------------------------------------------------------------------

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
