import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
import { sendVerification, verifyEmail } from "./email-verification.service";


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
  max: 300, // allow normal SPA session restoration and token refresh activity
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
router.post("/forgot-password", authRateLimit, authController.forgotPassword);
router.post("/reset-password", authRateLimit, authController.resetPassword);

// POST /api/auth/send-verification — resend verification email
router.post(
  "/send-verification",
  authenticate,
  async (req, res, next) => {
    try {
      const userId = (req as any).user?.sub;
      await sendVerification(userId);
      res.status(200).json({ message: "Verification email sent" });
    } catch (error: any) {
      if (error.message === "Email already verified") {
        res.status(400).json({ message: "Email already verified" });
        return;
      }
      next(error);
    }
  }
);

// GET /api/auth/verify-email?token=xxx — verify the token from email link
router.get(
  "/verify-email",
  async (req, res, next) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ message: "Token is required" });
        return;
      }
      await verifyEmail(token);
      res.redirect(`${process.env.CLIENT_URL}/verify-email/success`);
    } catch (error: any) {
      res.redirect(
        `${process.env.CLIENT_URL}/verify-email/error?message=${encodeURIComponent(error.message)}`
      );
    }
  }
);


export default router;