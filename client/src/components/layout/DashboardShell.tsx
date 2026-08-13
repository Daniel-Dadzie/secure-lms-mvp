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
    <div className="flex h-screen overflow-hidden bg-[#F4F9F7]">
      <Sidebar
        navItems={navItems}
        portalLabel={portalLabel}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        profileHref={profileHref}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title={topBarTitle}
          breadcrumb={breadcrumb}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          profileHref={profileHref}
          notificationsHref={notificationsHref}
          helpHref={helpHref}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
