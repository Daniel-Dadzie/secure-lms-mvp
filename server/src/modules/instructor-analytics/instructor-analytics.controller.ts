import type { Request, Response, NextFunction } from "express";
import * as analyticsService from "./instructor-analytics.service";

export async function getCourseAnalytics(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const analytics = await analyticsService.getCourseAnalytics(req.params.courseId as string);
    res.status(200).json({ analytics });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function getInstructorOverview(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const instructorId = (req as any).user?.sub;
    const overview = await analyticsService.getInstructorOverview(instructorId);
    res.status(200).json(overview);
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}