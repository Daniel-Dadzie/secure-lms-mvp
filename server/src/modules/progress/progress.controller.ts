import type { Request, Response, NextFunction } from "express";
import * as progressService from "./progress.service";
import { z } from "zod";

const updateProgressSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED"]),
  progressSeconds: z.number().int().min(0).default(0),
});

export async function updateLessonProgress(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = updateProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const progress = await progressService.updateLessonProgress(
      userId,
      req.params.lessonId as string,
      parsed.data.status,
      parsed.data.progressSeconds
    );
    res.status(200).json({ progress });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    if (error.statusCode === 403) { res.status(403).json({ message: error.message }); return; }
    next(error);
  }
}

export async function getEnrollmentProgress(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const progress = await progressService.getEnrollmentProgress(
      userId, req.params.enrollmentId as string
    );
    res.status(200).json({ progress });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Enrollment not found" }); return; }
    next(error);
  }
}

export async function getStudentCertificates(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const certificates = await progressService.getStudentCertificates(userId);
    res.status(200).json({ certificates });
  } catch (error) { next(error); }
}