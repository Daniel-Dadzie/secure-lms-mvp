"use client";

import { Activity, Database, ShoppingCart, Users } from "lucide-react";
import type { PlatformHealth } from "@/types/admin";

interface PlatformHealthWidgetProps {
  health: PlatformHealth | null;
  loading?: boolean;
}

export function PlatformHealthWidget({ health, loading }: PlatformHealthWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!health) return null;

  const isOperational = health.status === "operational";

  const items = [
    {
      label: "Database",
      value: `${health.database.responseMs}ms`,
      sub: health.database.status,
      icon: Database,
    },
    {
      label: "Active Sessions",
      value: health.users.activeSessions.toString(),
      sub: "Refresh tokens",
      icon: Users,
    },
    {
      label: "Pending Purchases",
      value: health.purchases.pending.toString(),
      sub: `${health.purchases.failed} failed`,
      icon: ShoppingCart,
    },
    {
      label: "Failed Logins (24h)",
      value: health.auth.failedLogins24h.toString(),
      sub: `${health.support.unansweredQuestions24h} open support`,
      icon: Activity,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-lg font-bold text-slate-900">Platform Health</h2>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isOperational
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOperational ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {isOperational ? "All Systems Operational" : "Degraded"}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl bg-[#F4F9F7] px-4 py-3"
          >
            <item.icon className="h-5 w-5 text-[#196A54] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="text-lg font-extrabold text-[#0A4A3A]">{item.value}</p>
            </div>
            <p className="text-xs text-slate-400">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
