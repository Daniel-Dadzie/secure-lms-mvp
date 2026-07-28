import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200).trim(),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).trim(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  priceCents: z
    .number()
    .int("Price must be a whole number (cents)")
    .min(0, "Price cannot be negative")
    .max(1000000, "Price cannot exceed $10,000"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  categoryId: z.string().uuid().optional(),
  priceCents: z.number().int().min(0).max(1000000).optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const courseFiltersSchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseFilters = z.infer<typeof courseFiltersSchema>;