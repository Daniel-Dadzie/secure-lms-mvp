"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadUser = useAuthStore((state) => state.loadUser);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    console.log("[AUTH] AuthProvider: restoring session");

    void loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
