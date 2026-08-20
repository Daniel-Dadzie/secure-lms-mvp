import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
});

export const adminResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;