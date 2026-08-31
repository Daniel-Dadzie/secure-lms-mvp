"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { syncUserRegionOnce } from "@/lib/syncUserRegion";
import PageLoader from "@/components/shared/PageLoader";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

// ----------------------------------------------------------------------------
// ProtectedRoute — wraps any page that requires authentication.
// Redirects to /login if not authenticated.
// Redirects to /unauthorized if authenticated but wrong role.
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

    if (isAuthenticated) {
      void syncUserRegionOnce();
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return <PageLoader text="Restoring your session..." />;
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}