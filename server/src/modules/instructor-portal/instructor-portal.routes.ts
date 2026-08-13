import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as portalController from "./instructor-portal.controller";

const router = Router();

router.use(authenticate, requireRole(["INSTRUCTOR", "ADMIN"]));

router.get("/students", portalController.listStudents);
router.get("/reviews", portalController.listReviews);
router.patch("/reviews/:reviewId/reply", portalController.replyToReview);
router.get("/earnings", portalController.listEarnings);
router.get("/profile", portalController.getProfile);
router.patch("/profile", portalController.updateProfile);

export default router;
