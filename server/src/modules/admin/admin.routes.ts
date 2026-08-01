import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as adminController from "./admin.controller";

const router = Router();

// All admin routes require ADMIN role
const adminOnly = [authenticate, requireRole(["ADMIN"])];

router.get("/stats", ...adminOnly, adminController.getPlatformStats);
router.get("/audit-log", ...adminOnly, adminController.getAuditLog);
router.get("/courses", ...adminOnly, adminController.getAllCourses);
router.get("/users", ...adminOnly, adminController.getAllUsers);
router.post(
  "/users/:userId/verify-email",
  ...adminOnly,
  adminController.verifyUserEmail
);

export default router;