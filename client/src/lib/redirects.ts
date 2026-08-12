// src/lib/redirect.ts
import type { Role } from "@/types/auth";

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  INSTRUCTOR_DASHBOARD: "/instructor",
  STUDENT_DASHBOARD: "/student",
} as const;

// ----------------------------------------------------------------------------
// Central place for role-based redirect destinations.
// When Alice builds the dashboard pages, these paths just work —
// no hunting through components to update redirect logic.
// ----------------------------------------------------------------------------
export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return APP_ROUTES.ADMIN_DASHBOARD;
    case "INSTRUCTOR":
      return APP_ROUTES.INSTRUCTOR_DASHBOARD;
    case "STUDENT":
      return APP_ROUTES.STUDENT_DASHBOARD;
    default:
      return APP_ROUTES.HOME;
  }
}

