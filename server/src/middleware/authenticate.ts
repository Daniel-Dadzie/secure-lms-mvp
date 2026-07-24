import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import type { JwtPayload } from "../modules/auth/auth.types";

// ----------------------------------------------------------------------------
// Authentication middleware
// Verifies the access token from the Authorization header.
// ----------------------------------------------------------------------------

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      JWT_CONFIG.accessSecret,
      {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
      }
    ) as JwtPayload;

    (
      req as Request & {
        user: JwtPayload;
      }
    ).user = payload;

    next();
  } catch (error: unknown) {
    const errorName =
      error instanceof Error ? error.name : "";

    if (errorName === "TokenExpiredError") {
      res.status(401).json({
        message: "Token expired",
      });
      return;
    }

    res.status(401).json({
      message: "Invalid token",
    });
  }
}
