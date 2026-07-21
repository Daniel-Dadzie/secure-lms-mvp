import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

// ----------------------------------------------------------------------------
// Supported resource types for ownership checks.
// Add new resources here as modules are built (courses, lessons, etc.)
// ----------------------------------------------------------------------------
type OwnershipResource = "course" | "enrollment" | "purchase";

// ----------------------------------------------------------------------------
// requireOwnership middleware factory
// Checks that the authenticated user actually owns the resource they're
// trying to mutate. Must run AFTER authenticate (and optionally requireRole).
//
// Usage:
//   router.patch(
//     "/courses/:courseId",
//     authenticate,
//     requireRole(["INSTRUCTOR", "ADMIN"]),
//     requireOwnership("course"),
//     courseController.update
//   )
//
// For ADMIN role: ownership check is bypassed — admins can moderate
// any resource per the RBAC matrix.
//
// For all other roles: the resource is fetched and the owning field
// (instructorId, userId) is compared against req.user.sub.
// Returns 404 (not 403) for non-owned resources — avoids confirming
// the resource exists to an unauthorized requester (threat model: info
// disclosure via 403 enumeration, section 1.3).
// ----------------------------------------------------------------------------
export function requireOwnership(resource: OwnershipResource) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Admins bypass ownership checks — they can act on any resource
    if (user.role === "ADMIN") {
      next();
      return;
    }

    try {
      switch (resource) {
        case "course": {
          const rawCourseId = req.params.courseId;
          const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;
          
          if (!courseId) {
            res.status(400).json({ message: "Course ID required" });
            return;
          }

          const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true, isActive: true },
          });

          // 404 not 403 — avoids confirming the resource exists
          if (!course || !course.isActive) {
            res.status(404).json({ message: "Course not found" });
            return;
          }

          if (course.instructorId !== user.sub) {
            res.status(404).json({ message: "Course not found" });
            return;
          }

          break;
        }

        case "enrollment": {
          const rawEnrollmentId = req.params.enrollmentId;
          const enrollmentId = Array.isArray(rawEnrollmentId) ? rawEnrollmentId[0] : rawEnrollmentId;

          if (!enrollmentId) {
            res.status(400).json({ message: "Enrollment ID required" });
            return;
          }

          const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: { userId: true },
          });

          if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
          }

          if (enrollment.userId !== user.sub) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
          }

          break;
        }

        case "purchase": {
          const rawPurchaseId = req.params.purchaseId;
          const purchaseId = Array.isArray(rawPurchaseId) ? rawPurchaseId[0] : rawPurchaseId;

          if (!purchaseId) {
            res.status(400).json({ message: "Purchase ID required" });
            return;
          }

          const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            select: { userId: true },
          });

          if (!purchase) {
            res.status(404).json({ message: "Purchase not found" });
            return;
          }

          if (purchase.userId !== user.sub) {
            res.status(404).json({ message: "Purchase not found" });
            return;
          }

          break;
        }

        default: {
          res.status(500).json({ message: "Unknown resource type" });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}