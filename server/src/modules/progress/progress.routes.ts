import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as progressController from "./progress.controller";

const router = Router();

// Update lesson progress
router.patch(
  "/lessons/:lessonId",
  authenticate,
  requireRole(["STUDENT"]),
  progressController.updateLessonProgress
);

// Get progress for an enrollment
router.get(
  "/enrollments/:enrollmentId",
  authenticate,
  requireRole(["STUDENT"]),
  progressController.getEnrollmentProgress
);

// Get certificates
router.get(
  "/certificates",
  authenticate,
  requireRole(["STUDENT"]),
  progressController.getStudentCertificates
);

export default router;