// client/src/components/layout/DashboardShell.tsx
"use client";
import { useState } from "react";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  portalLabel: string;
  topBarTitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function DashboardShell({
  children,
  navItems,
  portalLabel,
  topBarTitle,
  breadcrumb,
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F9F7]">
      <Sidebar 
        navItems={navItems} 
        portalLabel={portalLabel} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Pass mobile toggle trigger handler down to TopBar */}
        <TopBar 
          title={topBarTitle} 
          breadcrumb={breadcrumb} 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        {/* Added standard padding and max-w constraints here */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}