import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import * as authService from "./auth.service";
import { JWT_CONFIG } from "../../config/jwt";

// ----------------------------------------------------------------------------
// Cookie config — httpOnly, Secure, SameSite-Strict per security policy.
// The refresh token cookie is scoped to /api/auth only, not the whole app,
// to minimise exposure surface (security team requirement, section 3.5).
// ----------------------------------------------------------------------------
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: JWT_CONFIG.refreshExpiryMs,
};

function clearRefreshCookie(res: Response): void {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api/auth",
  });
}

// ----------------------------------------------------------------------------
// POST /api/auth/register
// ----------------------------------------------------------------------------
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { tokens, user } = await authService.register(parsed.data);

    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      message: "Registration successful",
      accessToken: tokens.accessToken,
      user,
    });
  } catch (error: any) {
    if (error.statusCode === 409) {
      // Generic message — don't reveal whether email exists
      res.status(409).json({ message: "Registration failed" });
      return;
    }
    next(error);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------------------
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const { tokens, user } = await authService.login(
      parsed.data,
      ipAddress,
      userAgent
    );

    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      user,
    });
  } catch (error: any) {
    if (error.statusCode === 401) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    next(error);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/logout
// ----------------------------------------------------------------------------
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // req.user may be set by authenticate middleware if token is still valid
      const userId = (req as any).user?.sub;
      await authService.logout(refreshToken, userId);
    }

    clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// POST /api/auth/refresh
// ----------------------------------------------------------------------------
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    const ipAddress = req.ip;
    const tokens = await authService.refresh(refreshToken, ipAddress);

    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      accessToken: tokens.accessToken,
    });
  } catch (error: any) {
    if (error.statusCode === 401) {
      clearRefreshCookie(res);
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }
    next(error);
  }
}

// ----------------------------------------------------------------------------
// GET /api/auth/me
// ----------------------------------------------------------------------------
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await authService.getCurrentUser(userId);
    res.status(200).json({ user });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    next(error);
  }
}