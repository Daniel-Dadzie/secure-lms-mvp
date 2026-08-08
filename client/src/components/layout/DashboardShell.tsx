"use client";

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
  return (
    // Updated background from bg-slate-50 to the brand's custom mint tint
    <div className="flex h-screen overflow-hidden bg-[#F4F9F7]">
      <Sidebar navItems={navItems} portalLabel={portalLabel} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={topBarTitle} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}