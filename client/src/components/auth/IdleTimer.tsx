"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const LAST_ACTIVE_KEY = "lms_last_active_timestamp";

export function IdleTimer() {
  const router = useRouter();
  const logout = useAuthStore((state: any) => state.logout);
  const user = useAuthStore((state: any) => state.user);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return; // Do nothing if logged out

    const handleAutoLogout = async () => {
      try {
        localStorage.removeItem(LAST_ACTIVE_KEY);
        if (logout) await logout();
      } catch (err) {
        console.error("Auto logout cleanup error:", err);
      } finally {
        router.push("/login?reason=idle");
      }
    };

    const resetTimer = () => {
      const now = Date.now().toString();
      localStorage.setItem(LAST_ACTIVE_KEY, now);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleAutoLogout, IDLE_TIMEOUT_MS);
    };

    // Synchronize activity across multiple open tabs
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVE_KEY) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(handleAutoLogout, IDLE_TIMEOUT_MS);
      }
    };

    // Only track meaningful user intent events. 
    // Excluding 'mousemove' and 'scroll' completely stops any page freezing or scroll-lag.
    const events = ["mousedown", "keydown", "click", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    window.addEventListener("storage", handleStorageEvent);

    // Initialize timer on mount
    timerRef.current = setTimeout(handleAutoLogout, IDLE_TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [user, logout, router]);

  return null;
}