import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  order: z.number().int().min(1),
  durationSeconds: z.number().int().min(0).default(0),
  contentUrl: z.string().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  order: z.number().int().min(1).optional(),
  durationSeconds: z.number().int().min(0).optional(),
  contentUrl: z.string().optional(),
});

export const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(1),
    })
  ),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;