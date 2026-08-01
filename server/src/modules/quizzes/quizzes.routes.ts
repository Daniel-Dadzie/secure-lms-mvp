import { Router } from "express";
import { authenticate, requireOwnership, requireRole } from "../../middleware";
import * as quizzesController from "./quizzes.controller";

const router = Router();

router.post(
  "/:quizId/start",
  authenticate,
  requireRole(["STUDENT"]),
  quizzesController.startQuizAttempt
);

router.post(
  "/attempts/:attemptId/submit",
  authenticate,
  requireRole(["STUDENT"]),
  quizzesController.submitQuizAttempt
);

router.get(
  "/:quizId/attempts",
  authenticate,
  requireRole(["STUDENT"]),
  quizzesController.getQuizAttempts
);

router.post(
  "/courses/:courseId/quizzes",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("course"),
  quizzesController.createQuiz
);

router.patch(
  "/:quizId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("quiz"),
  quizzesController.updateQuiz
);

router.delete(
  "/:quizId",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("quiz"),
  quizzesController.deleteQuiz
);

router.get(
  "/:quizId/instructor-view",
  authenticate,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  requireOwnership("quiz"),
  quizzesController.getQuizForInstructor
);

export default router;