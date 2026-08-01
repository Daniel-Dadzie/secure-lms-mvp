import { z } from "zod";

export const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
  // { "questionId": "selectedOptionId" } — every value is a raw option id (e.g. "a"),
  // validated against real questions server-side during grading, not here.
});

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

const questionInputSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z.array(optionSchema).min(2, "At least 2 options required"),
  correctOption: z.string().min(1),
  order: z.number().int().min(0),
}).refine(
  (data) => data.options.some((opt) => opt.id === data.correctOption),
  { message: "correctOption must match one of the provided option ids", path: ["correctOption"] }
);

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  lessonId: z.string().uuid().optional(),
  passMark: z.number().int().min(0).max(100).default(70),
  timeLimit: z.number().int().min(1).optional(),
  questions: z.array(questionInputSchema).min(1, "At least 1 question required"),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  passMark: z.number().int().min(0).max(100).optional(),
  timeLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});