import { Router } from "express";
import { authenticate, optionalAuthenticate, requireRole, requireOwnership } from "../../middleware";
import * as coursesController from "./courses.controller";
import * as modulesController from "./modules.controller";
import * as lessonsController from "./lessons.controller";
import * as quizzesController from "../quizzes/quizzes.controller";
import { thumbnailUpload } from "../../middleware/upload";
import reviewsRouter from "../reviews/reviews.routes";
import { uploadThumbnailHandler, generateVideoUploadUrlHandler, uploadLessonVideoHandler } from "./courses.upload.controller";
import { videoUpload } from "../../middleware/upload";
const router = Router();

// ----------------------------------------------------------------------------
// Public catalogue routes
// Must be registered before any "/:courseId/..." pattern-based routes below
// that could otherwise shadow specific paths like "/instructor/mine".
// ----------------------------------------------------------------------------
router.get("/", coursesController.getPublishedCourses);

// ----------------------------------------------------------------------------
// Instructor: manage own courses
// ----------------------------------------------------------------------------
router.get(
  "/instructor/mine",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  coursesController.getInstructorCourses
);

router.post(
  "/",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  coursesController.createCourse
);

// ----------------------------------------------------------------------------
// Admin: manage all courses
// ----------------------------------------------------------------------------
router.get(
  "/admin/all",
  authenticate,
  requireRole(["ADMIN"]),
  coursesController.getAllCourses
);

// ----------------------------------------------------------------------------
// Single course detail (public) — registered after the specific paths above
// ----------------------------------------------------------------------------
router.get("/:courseId", optionalAuthenticate, coursesController.getPublishedCourseById);

router.patch(
  "/:courseId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.updateCourse
);

router.patch(
  "/:courseId/publish",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.publishCourse
);

router.patch(
  "/:courseId/unpublish",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  coursesController.unpublishCourse
);

router.delete(
  "/:courseId",
  authenticate,
  requireRole(["ADMIN"]),
  coursesController.archiveCourse
);

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
  "/:courseId/modules/:moduleId/lessons/:lessonId/stream",
  lessonsController.streamLessonVideoHandler
);

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


// ----------------------------------------------------------------------------
// Quiz routes
// ---------------------------------------------------------------------------- 
router.get(
  "/:courseId/quizzes",
  authenticate,
  quizzesController.getCourseQuizzes
);

router.get(
  "/:courseId/lessons/:lessonId/quiz",
  authenticate,
  quizzesController.getLessonQuiz
);


// Mount reviews as nested resource under courses
router.use("/:courseId/reviews", reviewsRouter);

router.post(
  "/:courseId/modules/:moduleId/lessons/:lessonId/video",
  videoUpload.single("video"),
  uploadLessonVideoHandler
);

export default router;