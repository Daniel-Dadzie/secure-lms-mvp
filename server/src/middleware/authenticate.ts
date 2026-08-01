import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import { prisma } from "../config/prisma";
import type { JwtPayload } from "../modules/auth/auth.types";

// ----------------------------------------------------------------------------
// Authentication middleware
// Verifies the access token from the Authorization header, then confirms the
// user is still active in the database. This closes a real exposure window:
// without the DB check, a deactivated user's still-valid JWT would continue
// to work on every route until natural token expiry (up to 15 min), since
// suspension only revokes refresh tokens, not tokens already issued.
// Adds one indexed lookup per authenticated request — an accepted tradeoff
// for a platform where account suspension needs to take effect immediately.
// ----------------------------------------------------------------------------

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        message: "Account is deactivated",
      });
      return;
    }

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