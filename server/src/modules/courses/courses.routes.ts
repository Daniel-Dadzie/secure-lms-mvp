import { Router } from "express";
import { authenticate, requireRole, requireOwnership } from "../../middleware";
import * as modulesController from "./modules.controller";
import * as lessonsController from "./lessons.controller";
import { thumbnailUpload } from "../../middleware/upload";
import reviewsRouter from "../reviews/reviews.routes";
import { uploadThumbnailHandler, generateVideoUploadUrlHandler } from "./courses.upload.controller";

const router = Router();
// Thumbnail upload — multipart/form-data
router.post(
  "/:courseId/thumbnail",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  thumbnailUpload.single("thumbnail"),
  uploadThumbnailHandler
);

// Request signed URL for video upload
router.post(
  "/:courseId/lessons/:lessonId/video-upload-url",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  generateVideoUploadUrlHandler
);

// ----------------------------------------------------------------------------
// Module routes
// ----------------------------------------------------------------------------
router.get(
  "/:courseId/modules",
  modulesController.getModulesByCourse
);

router.post(
  "/:courseId/modules",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  modulesController.createModule
);

router.patch(
  "/:courseId/modules/reorder",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  modulesController.reorderModules
);

router.patch(
  "/:courseId/modules/:moduleId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  modulesController.updateModule
);

router.delete(
  "/:courseId/modules/:moduleId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  modulesController.deleteModule
);

// ----------------------------------------------------------------------------
// Lesson routes
// ----------------------------------------------------------------------------
router.get(
  "/:courseId/modules/:moduleId/lessons/:lessonId",
  authenticate,
  lessonsController.getLessonById
);

router.post(
  "/:courseId/modules/:moduleId/lessons",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  lessonsController.createLesson
);

router.patch(
  "/:courseId/modules/:moduleId/lessons/reorder",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  lessonsController.reorderLessons
);

router.patch(
  "/:courseId/modules/:moduleId/lessons/:lessonId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  lessonsController.updateLesson
);

router.delete(
  "/:courseId/modules/:moduleId/lessons/:lessonId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  lessonsController.deleteLesson
);

// Mount reviews as nested resource under courses
router.use("/:courseId/reviews", reviewsRouter);