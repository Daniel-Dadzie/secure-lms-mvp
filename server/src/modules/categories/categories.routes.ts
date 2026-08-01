import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as categoriesController from "./categories.controller";

const router = Router();

// Public — anyone can browse categories
router.get("/", categoriesController.getAllCategories);

// Admin only — manage categories
router.post(
  "/",
  authenticate,
  requireRole(["ADMIN"]),
  categoriesController.createCategory
);

router.delete(
  "/:categoryId",
  authenticate,
  requireRole(["ADMIN"]),
  categoriesController.deleteCategory
);

export default router;