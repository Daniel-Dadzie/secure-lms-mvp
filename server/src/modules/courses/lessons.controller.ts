import type { Request, Response, NextFunction } from "express";
import * as lessonsService from "./lessons.service";
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema } from "./lessons.schemas";

export async function getLessonById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const userRole = (req as any).user?.role;
    const lesson = await lessonsService.getLessonById(req.params.lessonId as string, userId, userRole);
    res.status(200).json({ lesson });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }
    next(error);
  }
}

export async function createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createLessonSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const lesson = await lessonsService.createLesson(req.params.moduleId as string, parsed.data, userId);
    res.status(201).json({ lesson });
  } catch (error) { next(error); }
}

export async function updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateLessonSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const lesson = await lessonsService.updateLesson(req.params.lessonId as string, parsed.data, userId);
    res.status(200).json({ lesson });
  } catch (error) { next(error); }
}

export async function deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    await lessonsService.deleteLesson(req.params.lessonId as string, userId);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function reorderLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = reorderLessonsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    await lessonsService.reorderLessons(req.params.moduleId as string, parsed.data, userId);
    res.status(200).json({ message: "Lessons reordered" });
  } catch (error) { next(error); }
}