import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as usersController from "./users.controller";

const router = Router();

// ----------------------------------------------------------------------------
// User profile routes — any authenticated user
// ----------------------------------------------------------------------------
router.get("/profile", authenticate, usersController.getProfile);
router.patch("/profile", authenticate, usersController.updateProfile);

// ----------------------------------------------------------------------------
// Admin routes — ADMIN role only
// ----------------------------------------------------------------------------
router.get(
  "/admin/users",
  authenticate,
  requireRole(["ADMIN"]),
  usersController.listUsers
);

router.post(
  "/admin/users/:userId/deactivate",
  authenticate,
  requireRole(["ADMIN"]),
  usersController.deactivateUser
);

router.post(
  "/admin/users/:userId/activate",
  authenticate,
  requireRole(["ADMIN"]),
  usersController.activateUser
);

router.post(
  "/admin/users/:userId/reset-password",
  authenticate,
  requireRole(["ADMIN"]),
  usersController.resetUserPassword
);

export default router;