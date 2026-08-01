import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as enrolmentsController from "./enrolments.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRole(["STUDENT"]),
  enrolmentsController.getStudentEnrollments
);

router.get(
  "/:enrollmentId",
  authenticate,
  requireRole(["STUDENT"]),
  enrolmentsController.getEnrollmentById
);

// Free course enrollment
router.post(
  "/free",
  authenticate,
  requireRole(["STUDENT"]),
  enrolmentsController.enrollFree
);

export default router;