import { Router } from "express";
import { authenticate, requireRole, requireOwnership } from "../../middleware";
import * as analyticsController from "./instructor-analytics.controller";

const router = Router();

router.get(
  "/overview",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  analyticsController.getInstructorOverview
);

router.get(
  "/courses/:courseId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  analyticsController.getCourseAnalytics
);

export default router;