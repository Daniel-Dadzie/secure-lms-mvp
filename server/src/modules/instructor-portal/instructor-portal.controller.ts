import type { Request, Response, NextFunction } from "express";
import * as portalService from "./instructor-portal.service";
import {
  listStudentsQuerySchema,
  listReviewsQuerySchema,
  replyToReviewSchema,
  listEarningsQuerySchema,
  updateInstructorProfileSchema,
} from "./instructor-portal.schemas";

export async function listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = listStudentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user.sub;
    const result = await portalService.listInstructorStudents(instructorId, parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = listReviewsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user.sub;
    const result = await portalService.listInstructorReviews(instructorId, parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function replyToReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = replyToReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user.sub;
    const review = await portalService.replyToReview(
      req.params.reviewId as string,
      instructorId,
      parsed.data.reply
    );
    res.status(200).json({ review });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function listEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = listEarningsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user.sub;
    const result = await portalService.listInstructorEarnings(instructorId, parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const profile = await portalService.getInstructorProfile(userId);
    res.status(200).json({ profile });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateInstructorProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user.sub;
    const profile = await portalService.updateInstructorProfile(userId, parsed.data);
    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
}
