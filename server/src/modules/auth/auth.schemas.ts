import { z } from "zod";

// ----------------------------------------------------------------------------
// Register input — validated on every POST /auth/register request.
// Role is restricted to STUDENT or INSTRUCTOR — clients can never
// self-assign ADMIN. The security team's RBAC matrix explicitly requires this.
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
  role: z.enum(["STUDENT", "INSTRUCTOR"], {
    message: "Role must be STUDENT or INSTRUCTOR",
  }),
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

// ----------------------------------------------------------------------------
// Inferred TypeScript types from the schemas — used in service/controller.
// ----------------------------------------------------------------------------
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;