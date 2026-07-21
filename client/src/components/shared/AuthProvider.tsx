"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    // Attempt to restore session from httpOnly cookie on every page load.
    // If the refresh cookie is valid, this silently re-authenticates the user
    // without them needing to log in again.
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}