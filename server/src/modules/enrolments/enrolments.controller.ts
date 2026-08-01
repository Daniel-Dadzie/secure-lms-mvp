import type { Request, Response, NextFunction } from "express";
import * as enrolmentsService from "./enrolments.service";
import { z } from "zod";

const enrollFreeSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export async function getStudentEnrollments(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const enrollments = await enrolmentsService.getStudentEnrollments(userId);
    res.status(200).json({ enrollments });
  } catch (error) { next(error); }
}

export async function getEnrollmentById(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const enrollment = await enrolmentsService.getEnrollmentById(
      req.params.enrollmentId as string, userId
    );
    res.status(200).json({ enrollment });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Enrollment not found" }); return; }
    next(error);
  }
}

export async function enrollFree(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = enrollFreeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const enrollment = await enrolmentsService.enrollFree(
      userId, parsed.data.courseId
    );
    res.status(201).json({ enrollment });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    if (error.statusCode === 409) { res.status(409).json({ message: error.message }); return; }
    next(error);
  }
}