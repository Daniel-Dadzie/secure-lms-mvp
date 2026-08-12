"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/lib/admin/formatters";

interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  completionCount: number;
  revenueCents: number;
  averageProgress: number;
}

interface OverviewData {
  courses: CourseAnalytics[];
  totals: {
    totalEnrollments: number;
    totalCompletions: number;
    totalRevenueCents: number;
  };
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/instructor/analytics/overview");
        setOverview(res.data);
      } catch (err: any) {
        setError("Failed to load analytics. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "Instructor";

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b border-slate-200 py-8 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Here&apos;s how your courses are performing.
              </p>
            </div>
            <Link
              href="/instructor/courses"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create Course
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Totals summary */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 animate-pulse mb-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : overview?.totals ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
              {[
                {
                  label: "Total Enrollments",
                  value: overview.totals.totalEnrollments.toLocaleString(),
                  icon: "🎓",
                },
                {
                  label: "Total Completions",
                  value: overview.totals.totalCompletions.toLocaleString(),
                  icon: "✅",
                },
                {
                  label: "Total Revenue",
                  // revenueCents correctly uses finalAmountCents (post-discount)
                  // per the backend's live-computed analytics — not gross amountCents
                  value: formatCurrency(overview.totals.totalRevenueCents),
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
          ) : null}

          {/* Per-course breakdown */}
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : overview && overview.courses.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">Course</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600">Enrollments</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600">Completions</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600">Avg Progress</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-600">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.courses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {course.courseTitle}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {course.enrollmentCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {course.completionCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {course.averageProgress}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(course.revenueCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <span className="text-4xl mb-4">📚</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-md">
                You haven&apos;t created any courses yet. Start sharing your expertise with students today.
              </p>
              <Link
                href="/instructor/courses"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Create Your First Course
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

