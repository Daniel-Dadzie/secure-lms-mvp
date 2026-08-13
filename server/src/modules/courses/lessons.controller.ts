import type { Request, Response, NextFunction } from "express";
import * as lessonsService from "./lessons.service";
import { verifyLessonStreamToken, streamLessonVideo } from "./lesson-stream.service";
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema } from "./lessons.schemas";
import { prisma } from "../../config/prisma";

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

export async function streamLessonVideoHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : null;
    if (!token) {
      res.status(401).json({ message: "Stream token required" });
      return;
    }

    const payload = verifyLessonStreamToken(token);
    const { courseId, lessonId } = req.params;

    if (payload.lessonId !== lessonId || payload.courseId !== courseId) {
      res.status(403).json({ message: "Invalid stream token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, isActive: true },
    });

    if (!user?.isActive) {
      res.status(403).json({ message: "Video not available" });
      return;
    }

    await streamLessonVideo(
      lessonId as string,
      payload.sub,
      user.role,
      req,
      res
    );
  } catch (error: any) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      res.status(401).json({ message: "Stream token expired" });
      return;
    }
    next(error);
  }
}