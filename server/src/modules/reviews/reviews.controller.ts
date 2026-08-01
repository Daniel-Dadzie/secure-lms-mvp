import type { Request, Response, NextFunction } from "express";
import * as reviewsService from "./reviews.service";
import { createReviewSchema, updateReviewSchema } from "./reviews.schemas";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function getCourseReviews(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination params" });
      return;
    }
    const result = await reviewsService.getCourseReviews(
      req.params.courseId as string,
      parsed.data.page,
      parsed.data.limit
    );
    res.status(200).json(result);
  } catch (error) { next(error); }
}

export async function createReview(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const review = await reviewsService.createReview(
      req.params.courseId as string, userId, parsed.data
    );
    res.status(201).json({ review });
  } catch (error: any) {
    if (error.statusCode === 403) { res.status(403).json({ message: error.message }); return; }
    if (error.statusCode === 409) { res.status(409).json({ message: error.message }); return; }
    next(error);
  }
}

export async function updateReview(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = updateReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const review = await reviewsService.updateReview(
      req.params.reviewId as string, userId, parsed.data
    );
    res.status(200).json({ review });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Review not found" }); return; }
    next(error);
  }
}

export async function hideReview(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await reviewsService.hideReview(req.params.reviewId as string, adminId);
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Review not found" }); return; }
    next(error);
  }
}

export async function restoreReview(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await reviewsService.restoreReview(req.params.reviewId as string, adminId);
    res.status(200).json({ message: "Review restored" });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Review not found" }); return; }
    next(error);
  }
}