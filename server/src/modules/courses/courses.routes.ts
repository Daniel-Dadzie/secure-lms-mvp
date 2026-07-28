import { Router } from "express";
import { authenticate, requireRole, requireOwnership } from "../../middleware";
import * as coursesController from "./courses.controller";

const router = Router();

// ----------------------------------------------------------------------------
// Public routes — no auth required
// ----------------------------------------------------------------------------
router.get("/", coursesController.getPublishedCourses);
router.get("/:courseId", coursesController.getPublishedCourseById);

// ----------------------------------------------------------------------------
// Instructor routes
// ----------------------------------------------------------------------------
router.get(
  "/instructor/my-courses",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  coursesController.getInstructorCourses
);

router.post(
  "/",
  authenticate,
  requireRole(["INSTRUCTOR"]),
  coursesController.createCourse
);

router.patch(
  "/:courseId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.updateCourse
);

router.post(
  "/:courseId/publish",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.publishCourse
);

router.post(
  "/:courseId/unpublish",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.unpublishCourse
);

// ----------------------------------------------------------------------------
// Admin routes
// ----------------------------------------------------------------------------
router.get(
  "/admin/all",
  authenticate,
  requireRole(["ADMIN"]),
  coursesController.getAllCourses
);

router.delete(
  "/:courseId",
  authenticate,
  requireRole(["ADMIN"]),
  coursesController.archiveCourse
);

export default router;