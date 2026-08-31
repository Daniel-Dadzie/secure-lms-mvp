"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { PlatformHealthWidget } from "@/components/admin/PlatformHealthWidget";
import { RegistrationChart } from "@/components/admin/RegistrationChart";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type {
  AnalyticsOverview,
  PlatformHealth,
  PlatformStats,
} from "@/types/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, analyticsRes, healthRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/analytics/overview?months=6"),
          api.get("/admin/health"),
        ]);
        setStats(statsRes.data.stats);
        setAnalytics(analyticsRes.data.analytics);
        setHealth(healthRes.data.health);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
        setError("Could not load platform statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and recent activity.</p>
      </div>

      <AdminStatGrid
        stats={stats}
        loading={loading}
        trends={
          analytics
            ? {
                users: analytics.summary.userGrowthPercent,
                revenue: analytics.summary.revenueGrowthPercent,
              }
            : undefined
        }
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-6 sm:space-y-8 animate-pulse">
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-2">
              <LoadingSkeleton className="h-8 w-24" />
              <LoadingSkeleton className="h-4 w-40" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-2">
              <LoadingSkeleton className="h-8 w-24" />
              <LoadingSkeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-80 flex items-center justify-center">
              <LoadingSkeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-80 flex items-center justify-center">
              <LoadingSkeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 to-teal-50 p-4 sm:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A4A3A]">
                  {analytics.summary.platformCompletionRate}%
                </p>
                <p className="text-sm font-medium text-slate-600 mt-1">Platform Completion Rate</p>
              </div>
              <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-500/10 to-purple-50 p-4 sm:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A4A3A]">
                  {analytics.summary.monthlyActiveUsers.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-slate-600 mt-1">Monthly Active Users</p>
              </div>
            </div>
          )}

          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <section className="lg:col-span-2 min-w-0">
                <RegistrationChart data={analytics.registrations} />
              </section>
              <section className="min-w-0">
                <RevenueChart data={analytics.revenue} />
              </section>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
              <section className="lg:col-span-2 min-w-0">
                <ActivityFeed events={stats.recentActivity} showViewAll />
              </section>
              <section className="min-w-0">
                <PlatformHealthWidget health={health} loading={loading} />
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}