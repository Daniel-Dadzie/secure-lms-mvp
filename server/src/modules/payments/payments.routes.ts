import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as paymentsController from "./payments.controller";

const router = Router();

// Checkout single course
router.post(
  "/checkout",
  authenticate,
  requireRole(["STUDENT"]),
  paymentsController.checkout
);

// Checkout entire cart
router.post(
  "/checkout/cart",
  authenticate,
  requireRole(["STUDENT"]),
  paymentsController.checkoutCart
);

// Purchase history
router.get(
  "/purchases",
  authenticate,
  requireRole(["STUDENT"]),
  paymentsController.getPurchaseHistory
);

// Single purchase detail
router.get(
  "/purchases/:purchaseId",
  authenticate,
  requireRole(["STUDENT"]),
  paymentsController.getPurchaseById
);

router.post(
  "/webhook", 
  paymentsController.webhook); // public, no auth — signature-verified instead

router.get(
  "/verify/:reference", 
  authenticate, requireRole(["STUDENT"]), paymentsController.verifyPayment);

export default router;