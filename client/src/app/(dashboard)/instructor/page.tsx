"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, BarChart3, Star, Plus } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/lib/admin/formatters";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { InstructorOverview } from "@/types/instructor";

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<InstructorOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/instructor/analytics/overview");
        if (!cancelled) setOverview(res.data);
      } catch {
        if (!cancelled) setError("Failed to load analytics. Please refresh the page.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "Instructor";
  const lowPerformingCourses = overview?.courses.filter(
    (c) => c.enrollmentCount === 0 || c.averageProgress < 30
  ) ?? [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s how your courses are performing.</p>
        </div>
        <Link
          href="/instructor/courses/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#196A54] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A4A3A] transition"
        >
          <Plus className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : overview?.totals ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Enrollments" value={overview.totals.totalEnrollments.toLocaleString()} icon="🎓" />
          <StatCard label="Total Completions" value={overview.totals.totalCompletions.toLocaleString()} icon="✅" />
          <StatCard label="Total Revenue" value={formatCurrency(overview.totals.totalRevenueCents)} icon="💰" />
        </div>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/instructor/courses", label: "My Courses", icon: BookOpen, desc: "Manage and publish" },
          { href: "/instructor/analytics", label: "Analytics", icon: BarChart3, desc: "Track performance" },
          { href: "/instructor/reviews", label: "Reviews", icon: Star, desc: "Reply to students" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#196A54]/30 transition"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#196A54]">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {lowPerformingCourses.length > 0 && !isLoading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-900 text-sm">Courses needing attention</h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {lowPerformingCourses.slice(0, 3).map((c) => (
              <li key={c.courseId}>
                {c.courseTitle} — {c.enrollmentCount === 0 ? "no enrollments yet" : `${c.averageProgress}% avg progress`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Courses</h2>
        {isLoading ? (
          <LoadingSkeleton className="h-48 w-full rounded-2xl" />
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
                      <Link href={`/instructor/courses/${course.courseId}/edit`} className="hover:text-[#196A54]">
                        {course.courseTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">{course.enrollmentCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{course.completionCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{course.averageProgress}%</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(course.revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No courses yet"
            description="Start sharing your expertise with students today."
            action={
              <Link
                href="/instructor/courses/create"
                className="rounded-lg bg-[#196A54] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#0A4A3A] transition"
              >
                Create Your First Course
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
