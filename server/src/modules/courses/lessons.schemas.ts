import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  order: z.number().int().min(1),
  contentType: z.enum(["VIDEO", "TEXT"]).default("VIDEO"),
  durationSeconds: z.number().int().min(0).default(0),
  contentUrl: z.string().optional(),
  contentText: z.string().optional(),
}).refine(
  (data) => {
    if (data.contentType === "VIDEO") {
      return true; // contentUrl is optional for video (can be added later)
    }
    if (data.contentType === "TEXT") {
      return data.contentText !== undefined && data.contentText.trim().length > 0;
    }
    return true;
  },
  {
    message: "Text lessons must have contentText",
    path: ["contentText"],
  }
);

export const updateLessonSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  order: z.number().int().min(1).optional(),
  contentType: z.enum(["VIDEO", "TEXT"]).optional(),
  durationSeconds: z.number().int().min(0).optional(),
  contentUrl: z.string().optional(),
  contentText: z.string().optional(),
}).refine(
  (data) => {
    if (data.contentType === "TEXT") {
      return data.contentText !== undefined && data.contentText.trim().length > 0;
    }
    return true;
  },
  {
    message: "Text lessons must have contentText",
    path: ["contentText"],
  }
);

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
