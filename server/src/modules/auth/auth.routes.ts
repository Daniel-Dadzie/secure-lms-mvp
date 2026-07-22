import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

// ----------------------------------------------------------------------------
// Rate limiting — stricter on auth endpoints per security policy (section 3.6)
// Login and register are the primary brute-force targets.
// ----------------------------------------------------------------------------
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts, please try again later",
  },
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
});

const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // refresh calls more frequently than login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many refresh attempts, please try again later",
  },
});

// ----------------------------------------------------------------------------
// Routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/refresh
// GET  /api/auth/me      — protected, requires valid access token
// ----------------------------------------------------------------------------
router.post("/register", authRateLimit, authController.register);
router.post("/login", authRateLimit, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", refreshRateLimit, authController.refreshToken);
router.get("/me", authenticate, authController.me);

export default router;