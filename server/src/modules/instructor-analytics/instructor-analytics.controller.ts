import type { Request, Response, NextFunction } from "express";
import * as analyticsService from "./instructor-analytics.service";
import * as portalService from "../instructor-portal/instructor-portal.service";
import { analyticsTrendsQuerySchema } from "../instructor-portal/instructor-portal.schemas";

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

export async function getAnalyticsTrends(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = analyticsTrendsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user.sub;
    const trends = await portalService.getInstructorAnalyticsTrends(
      instructorId,
      parsed.data.months,
      parsed.data.courseId
    );
    res.status(200).json({ trends });
  } catch (error) {
    next(error);
  }
}