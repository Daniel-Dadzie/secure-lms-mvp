import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as cartController from "./cart.controller";

const router = Router();

// Students only — cart is a student feature
router.get(
  "/",
  authenticate,
  requireRole(["STUDENT"]),
  cartController.getCart
);

router.post(
  "/items",
  authenticate,
  requireRole(["STUDENT"]),
  cartController.addToCart
);

router.delete(
  "/items/:courseId",
  authenticate,
  requireRole(["STUDENT"]),
  cartController.removeFromCart
);

router.delete(
  "/",
  authenticate,
  requireRole(["STUDENT"]),
  cartController.clearCart
);

export default router;