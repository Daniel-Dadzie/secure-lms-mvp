"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenueCents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.stats || res.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Platform overview and management tools.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Users", value: stats.totalUsers?.toLocaleString() ?? "—", icon: "👥" },
              { label: "Total Courses", value: stats.totalCourses?.toLocaleString() ?? "—", icon: "📚" },
              { label: "Total Enrollments", value: stats.totalEnrollments?.toLocaleString() ?? "—", icon: "🎓" },
              {
                label: "Total Revenue",
                value: `₵${((stats.totalRevenueCents ?? 0) / 100).toFixed(2)}`,
                icon: "💰",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="text-2xl">{stat.icon}</span>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Could not load platform statistics.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}