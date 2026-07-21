import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

// ----------------------------------------------------------------------------
// requireRole middleware factory
// Takes an array of permitted roles and returns a middleware function.
// Must be used AFTER authenticate — relies on req.user being set.
//
// Usage: router.get("/admin/users", authenticate, requireRole(["ADMIN"]), handler)
//
// Deny-by-default: if the user's role is not in the allowed list, 403.
// The security team's RBAC matrix is the source of truth for which roles
// are permitted on each route — this middleware enforces it at runtime.
// ----------------------------------------------------------------------------
export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      // Should never reach here if authenticate runs first,
      // but guard defensively — never assume middleware order.
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
}