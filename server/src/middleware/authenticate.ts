import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import type { JwtPayload } from "../modules/auth/auth.types";

// ----------------------------------------------------------------------------
// authenticate middleware
// Verifies the Bearer token in the Authorization header.
// On success, attaches the decoded payload to req.user so downstream
// middleware and controllers can read userId and role without re-verifying.
// On failure, returns 401 — never 403, since the client isn't authenticated
// yet (403 is for authenticated-but-unauthorised).
// ----------------------------------------------------------------------------
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_CONFIG.accessSecret) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    res.status(401).json({ message: "Invalid token" });
  }
}