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
    // 1. Lock the outer shell to the exact viewport height with hidden overflow
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F9F7]">
      {/* 2. Sidebar is locked to full height and never scrolls away */}
      <Sidebar
        navItems={navItems}
        portalLabel={portalLabel}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        profileHref={profileHref}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      {/* 3. Right side column containing TopBar and scrollable main content */}
      <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
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
        
        {/* 4. Only this <main> container handles scrolling when modules expand */}
        <main className="flex-1 overflow-y-auto bg-[#F4F9F7]">
          {children}
        </main>
      </div>
    </div>
  );
}