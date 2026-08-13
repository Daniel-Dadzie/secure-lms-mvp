"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import type { NavItem } from "@/components/layout/Sidebar";
import api from "@/lib/api";

const BASE_NAV: Omit<NavItem, "badge">[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: NavIcon("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6") },
  { name: "Users", href: "/admin/users", icon: NavIcon("M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z") },
  { name: "Instructors", href: "/admin/instructors", icon: NavIcon("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z") },
  { name: "Courses", href: "/admin/courses", icon: NavIcon("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253") },
  { name: "Enrollments", href: "/admin/enrollments", icon: NavIcon("M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10") },
  { name: "Purchases", href: "/admin/purchases", icon: NavIcon("M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z") },
  { name: "Reviews", href: "/admin/reviews", icon: NavIcon("M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z") },
  { name: "Statistics", href: "/admin/statistics", icon: NavIcon("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z") },
  { name: "Reports", href: "/admin/reports", icon: NavIcon("M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z") },
  { name: "Messages", href: "/admin/messages", icon: NavIcon("M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z") },
  { name: "Activity Logs", href: "/admin/activity-logs", icon: NavIcon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2") },
  { name: "Help Articles", href: "/admin/help-articles", icon: NavIcon("M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z") },
  { name: "Coupons", href: "/admin/coupons", icon: NavIcon("M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z") },
  { name: "Settings", href: "/admin/settings", icon: NavIcon("M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z") },
];

function NavIcon(d: string) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/instructors": "Instructors",
  "/admin/courses": "Courses",
  "/admin/enrollments": "Enrollments",
  "/admin/purchases": "Purchases",
  "/admin/reviews": "Reviews",
  "/admin/statistics": "Statistics",
  "/admin/reports": "Reports",
  "/admin/messages": "Messages",
  "/admin/activity-logs": "Activity Logs",
  "/admin/coupons": "Coupons",
  "/admin/help-articles": "Help Articles",
  "/admin/settings": "Settings",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageLabel = PAGE_LABELS[pathname] ?? "Admin";
  const [messageBadge, setMessageBadge] = useState(0);

  useEffect(() => {
    async function fetchBadge() {
      try {
        const [faqRes, ticketRes] = await Promise.all([
          api.get("/admin/messages/unread-count"),
          api.get("/admin/tickets/open-count"),
        ]);
        setMessageBadge((faqRes.data.count ?? 0) + (ticketRes.data.count ?? 0));
      } catch {
        // ignore
      }
    }
    fetchBadge();
  }, [pathname]);

  const navItems: NavItem[] = useMemo(
    () =>
      BASE_NAV.map((item) =>
        item.name === "Messages" && messageBadge > 0
          ? { ...item, badge: messageBadge }
          : item
      ),
    [messageBadge]
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell
        navItems={navItems}
        portalLabel="Admin Portal"
        topBarTitle="Admin Dashboard"
        breadcrumb={[{ label: "Admin" }, { label: pageLabel }]}
        profileHref="/admin/settings"
        notificationsHref="/admin/messages"
        helpHref="/admin/help-articles"
        searchPlaceholder="Search courses..."
      >
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
