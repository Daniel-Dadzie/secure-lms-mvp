"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  CategoryBarChart,
  EnrollmentCompletionChart,
  RegionDonutChart,
  UserGrowthRevenueChart,
} from "@/components/admin/AnalyticsCharts";
import { TopCoursesTable } from "@/components/admin/TopCoursesTable";
import { TopInstructorsTable } from "@/components/admin/TopInstructorsTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type { AnalyticsOverview } from "@/types/admin";

export default function AdminStatisticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics/overview?months=12")
      .then((res) => setAnalytics(res.data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-sm text-slate-500">Could not load analytics.</p>
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Statistics</h1>
        <p className="text-sm text-slate-500 mt-1">Platform growth, engagement, and performance analytics.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Active Users",
            value: formatNumber(summary.monthlyActiveUsers),
            sub: `${summary.userGrowthPercent}% user growth`,
          },
          {
            label: "Monthly Revenue",
            value: formatCurrency(summary.revenueThisMonthCents),
            sub: `${summary.revenueGrowthPercent}% revenue growth`,
          },
          {
            label: "Platform Completion Rate",
            value: `${summary.platformCompletionRate}%`,
            sub: "Across all enrollments",
          },
          {
            label: "New Users This Month",
            value: formatNumber(summary.newUsersThisMonth),
            sub: "Student signups",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
          >
            <p className="text-2xl font-extrabold text-[#0A4A3A]">{item.value}</p>
            <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2">{item.sub}</p>
          </div>
        ))}
      </div>

      <UserGrowthRevenueChart
        registrations={analytics.registrations}
        revenue={analytics.revenue}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <EnrollmentCompletionChart data={analytics.enrollmentVsCompletion} />
        <CategoryBarChart data={analytics.studentsByCategory} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RegionDonutChart title="Students by Region" data={analytics.studentsByRegion} />
        <RegionDonutChart title="Instructors by Region" data={analytics.instructorsByRegion} />
      </div>

      <TopCoursesTable />
      <TopInstructorsTable />
    </div>
  );
}
