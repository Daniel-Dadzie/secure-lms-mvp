"use client";

import { useState } from "react";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const SIDEBAR_COLLAPSED_KEY = "lms-sidebar-collapsed";

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  portalLabel: string;
  topBarTitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  profileHref?: string;
  notificationsHref?: string;
  helpHref?: string;
  searchPlaceholder?: string;
  searchPath?: string;
  notificationBadge?: number;
}

export function DashboardShell({
  children,
  navItems,
  portalLabel,
  topBarTitle,
  breadcrumb,
  profileHref,
  notificationsHref,
  helpHref,
  searchPlaceholder,
  searchPath,
  notificationBadge,
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  function toggleSidebarCollapse() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    // THE FIX: Changed h-screen overflow-hidden to min-h-screen w-full
    <div className="flex min-h-screen w-full bg-[#F4F9F7]">
      <Sidebar
        navItems={navItems}
        portalLabel={portalLabel}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        profileHref={profileHref}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          title={topBarTitle}
          breadcrumb={breadcrumb}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          profileHref={profileHref}
          notificationsHref={notificationsHref}
          helpHref={helpHref}
          searchPlaceholder={searchPlaceholder}
          searchPath={searchPath}
          notificationBadge={notificationBadge}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}