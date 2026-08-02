import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import type { JwtPayload } from "../modules/auth/auth.types";

// ----------------------------------------------------------------------------
// Optional authentication — attempts to decode a Bearer token if present,
// but never rejects the request if it's missing or invalid. Used for public
// routes (like support/ask) that still want to attribute the request to a
// logged-in user when possible, without requiring authentication.
//
// Deliberately does NOT check isActive against the DB the way authenticate
// does — a deactivated user asking an anonymous-style support question isn't
// a security concern the way it is for protected resource access, and
// skipping that lookup keeps this middleware cheap for a public, potentially
// high-traffic route.
// ----------------------------------------------------------------------------
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_CONFIG.accessSecret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as JwtPayload;

    (req as Request & { user?: JwtPayload }).user = payload;
  } catch {
    // Invalid/expired token on a public route — just proceed unauthenticated.
  }

  next();
}