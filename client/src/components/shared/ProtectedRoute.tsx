"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

// ----------------------------------------------------------------------------
// ProtectedRoute — wraps any page that requires authentication.
// Redirects to /login if not authenticated.
// Redirects to /unauthorized if authenticated but wrong role.
// Usage:
//   <ProtectedRoute allowedRoles={["ADMIN"]}>
//     <AdminDashboard />
//   </ProtectedRoute>
// ----------------------------------------------------------------------------
export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}