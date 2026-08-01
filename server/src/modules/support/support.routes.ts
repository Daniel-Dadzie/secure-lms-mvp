import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as supportController from "./support.controller";

const router = Router();

const supportRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many support requests, please try again later" },
});

// Public — support assistant available to all users including unauthenticated
router.post("/ask", supportRateLimit, supportController.ask);

export default router;