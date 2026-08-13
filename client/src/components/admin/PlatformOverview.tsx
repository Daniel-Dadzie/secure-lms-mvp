"use client";

import { formatNumber } from "@/lib/admin/formatters";
import type { PlatformStats } from "@/types/admin";

interface PlatformOverviewProps {
  stats: PlatformStats | null;
}

export function PlatformOverview({ stats }: PlatformOverviewProps) {
  if (!stats) return null;

  const items = [
    {
      label: "Published Courses",
      value: formatNumber(stats.courses.published),
    },
    {
      label: "Total Enrollments",
      value: formatNumber(stats.enrollments.total),
    },
    {
      label: "Completed Purchases",
      value: formatNumber(stats.revenue.totalPurchases),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Platform Overview</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-[#F4F9F7] px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
            <span className="text-lg font-extrabold text-[#0A4A3A]">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Platform health metrics and charts will be available in a future update.
      </p>
    </div>
  );
}
