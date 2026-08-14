"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { INSTRUCTOR_ONBOARDING_STEPS } from "@/config/onboardingSteps";
import { useAuthStore } from "@/store/auth.store";
import type { NavItem } from "@/components/layout/Sidebar";
import api from "@/lib/api";

const BASE_NAV: Omit<NavItem, "badge">[] = [
  { name: "Dashboard", href: "/instructor", icon: NavIcon("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6") },
  { name: "My Courses", href: "/instructor/courses", icon: NavIcon("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"), tourId: "my-courses" },
  { name: "Students", href: "/instructor/students", icon: NavIcon("M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"), tourId: "students" },
  { name: "Reviews", href: "/instructor/reviews", icon: NavIcon("M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z") },
  { name: "Analytics", href: "/instructor/analytics", icon: NavIcon("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"), tourId: "analytics" },
  { name: "Earnings", href: "/instructor/earnings", icon: NavIcon("M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z") },
  { name: "Help Center", href: "/instructor/help-center", icon: NavIcon("M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z") },
  { name: "Settings", href: "/instructor/settings", icon: NavIcon("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z") },
];

function NavIcon(d: string) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

const PAGE_LABELS: Record<string, string> = {
  "/instructor": "Dashboard",
  "/instructor/courses": "My Courses",
  "/instructor/courses/create": "Create Course",
  "/instructor/students": "Students",
  "/instructor/reviews": "Reviews",
  "/instructor/analytics": "Analytics",
  "/instructor/earnings": "Earnings",
  "/instructor/help-center": "Help Center",
  "/instructor/settings": "Settings",
  "/instructor/notifications": "Notifications",
  "/instructor/search": "Search",
};

function resolvePageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  if (pathname.includes("/edit")) return "Edit Course";
  return "Instructor";
}

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageLabel = resolvePageLabel(pathname);
  const { user } = useAuthStore();
  const [notificationBadge, setNotificationBadge] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchBadge() {
      try {
        const res = await api.get("/notifications");
        if (!cancelled) {
          setNotificationBadge(res.data.unreadCount ?? 0);
        }
      } catch {
        // ignore
      }
    }

    void fetchBadge();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navItems: NavItem[] = useMemo(() => BASE_NAV, []);

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <DashboardShell
        navItems={navItems}
        portalLabel="Instructor Portal"
        topBarTitle="Instructor Dashboard"
        breadcrumb={[{ label: "Instructor", href: "/instructor" }, { label: pageLabel }]}
        profileHref="/instructor/settings"
        notificationsHref="/instructor/notifications"
        helpHref="/instructor/help-center"
        searchPlaceholder="Search your courses..."
        searchPath="/instructor/search"
        notificationBadge={notificationBadge}
      >
        {children}
      </DashboardShell>
      {user && (
        <OnboardingTour userId={user.id} role="INSTRUCTOR" steps={INSTRUCTOR_ONBOARDING_STEPS} />
      )}
    </ProtectedRoute>
  );
}
