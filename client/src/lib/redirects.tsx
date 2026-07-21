import type { Role } from "@/types/auth";

// ----------------------------------------------------------------------------
// Central place for role-based redirect destinations.
// When Alice builds the dashboard pages, these paths just work —
// no hunting through components to update redirect logic.
// ----------------------------------------------------------------------------
export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}