"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { STUDENT_ONBOARDING_STEPS } from "@/config/onboardingSteps";
import { useAuthStore } from "@/store/auth.store";
import type { NavItem } from "@/components/layout/Sidebar";
import api from "@/lib/api";

function NavIcon(d: string) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

const BASE_NAV: Omit<NavItem, "badge">[] = [
  { name: "Dashboard", href: "/student", icon: NavIcon("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6") },
  { name: "Browse Courses", href: "/student/courses", icon: NavIcon("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"), tourId: "browse-courses" },
  { name: "My Courses", href: "/student/my-learning", icon: NavIcon("M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"), tourId: "my-learning" },
  { name: "Certificates", href: "/student/certificates", icon: NavIcon("M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"), tourId: "certificates" },
  { name: "Help Center", href: "/student/help-center", icon: NavIcon("M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"), tourId: "help-center" },
];

const PAGE_LABELS: Record<string, string> = {
  "/student": "Dashboard",
  "/student/courses": "Browse Courses",
  "/student/my-learning": "My Courses",
  "/student/certificates": "Certificates",
  "/student/help-center": "Help Center",
  "/student/profile": "Profile",
  "/student/notifications": "Notifications",
  "/student/search": "Search",
};

function resolvePageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  if (pathname.startsWith("/student/courses/")) return "Course Details";
  return "Student";
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageLabel = resolvePageLabel(pathname);
  
  // Destructure isAuthenticated alongside user
  const { user, isAuthenticated } = useAuthStore(); 
  const [notificationBadge, setNotificationBadge] = useState(0);

  useEffect(() => {
    // Only attempt the fetch if the user session has fully initialized
    if (!isAuthenticated) return;

    let cancelled = false;

    async function fetchBadge() {
      try {
        const res = await api.get("/notifications");
        if (!cancelled) {
          setNotificationBadge(res.data.unreadCount ?? 0);
        }
      } catch (error: any) {
        // Explicitly ignore 401s just in case the request slips through
        if (error.response?.status !== 401) {
          console.error("Failed to fetch notification badge:", error);
        }
      }
    }

    void fetchBadge();

    return () => {
      cancelled = true;
    };
  }, [pathname, isAuthenticated]); // Add isAuthenticated to the dependency array

  const navItems: NavItem[] = useMemo(() => BASE_NAV, []);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <DashboardShell
        navItems={navItems}
        portalLabel="Student Portal"
        topBarTitle="Student Dashboard"
        breadcrumb={[{ label: "Student", href: "/student" }, { label: pageLabel }]}
        profileHref="/student/profile"
        notificationsHref="/student/notifications"
        helpHref="/student/help-center"
        searchPlaceholder="Search courses..."
        searchPath="/student/search"
        notificationBadge={notificationBadge}
      >
        {children}
      </DashboardShell>
      {user && (
        <OnboardingTour userId={user.id} role="STUDENT" steps={STUDENT_ONBOARDING_STEPS} />
      )}
    </ProtectedRoute>
  );
}