import { Router } from "express";
import { authenticate, optionalAuthenticate, requireRole } from "../../middleware";
import * as reviewsController from "./reviews.controller";

const router = Router({ mergeParams: true });
// mergeParams: true — needed to access :courseId from parent router

// Public — visible reviews for viewable courses (optional auth for draft preview)
router.get("/", optionalAuthenticate, reviewsController.getCourseReviews);

// Student — must be enrolled (enforced in service)
router.post(
  "/",
  authenticate,
  requireRole(["STUDENT"]),
  reviewsController.createReview
);

// Student — update own review
router.patch(
  "/:reviewId",
  authenticate,
  requireRole(["STUDENT"]),
  reviewsController.updateReview
);

// Admin — moderate reviews
router.patch(
  "/:reviewId/hide",
  authenticate,
  requireRole(["ADMIN"]),
  reviewsController.hideReview
);

router.patch(
  "/:reviewId/restore",
  authenticate,
  requireRole(["ADMIN"]),
  reviewsController.restoreReview
);

export default router;