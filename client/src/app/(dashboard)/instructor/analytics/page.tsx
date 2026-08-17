"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { EnrollmentCompletionChart } from "@/components/admin/AnalyticsCharts";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/admin/formatters";
import type { InstructorAnalyticsTrends, InstructorCourse } from "@/types/instructor";

export default function InstructorAnalyticsPage() {
  const [trends, setTrends] = useState<InstructorAnalyticsTrends | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadCourses() {
      try {
        const res = await api.get("/courses/instructor/mine");
        if (!cancelled) setCourses(res.data.courses ?? []);
      } catch { /* ignore */ }
    }
    void loadCourses();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { months: 12 };
        if (courseId) params.courseId = courseId;
        const res = await api.get("/instructor/analytics/trends", { params });
        if (!cancelled) setTrends(res.data.trends);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Track enrollments, completions, and revenue over time.</p>
        </div>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All courses (cumulative)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {!trends ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Analytics Data Yet</h3>
          <p className="text-sm text-slate-500">Once you publish courses and students start enrolling, your analytics will appear here.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Enrollments" value={trends.summary.totalEnrollments} />
            <StatCard label="Total Completions" value={trends.summary.totalCompletions} />
            <StatCard label="Total Revenue" value={formatCurrency(trends.summary.totalRevenueCents)} />
            <StatCard label="Average Rating" value={trends.averageRating || "—"} />
          </div>

          {trends.enrollmentVsCompletion && trends.enrollmentVsCompletion.length > 0 && (
            <EnrollmentCompletionChart data={trends.enrollmentVsCompletion} />
          )}
          {!trends.enrollmentVsCompletion || trends.enrollmentVsCompletion.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Enrollments vs Completions</h3>
              <p className="text-sm text-slate-500">No enrollment data available yet. Once students start enrolling in your courses, this chart will display your enrollment and completion trends.</p>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue</h3>
            {trends.revenueByMonth && trends.revenueByMonth.length > 0 ? (
              <div className="space-y-2">
                {trends.revenueByMonth.slice(-6).map((row) => (
                  <div key={row.month} className="flex justify-between text-sm">
                    <span className="text-slate-600">{row.month}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(row.revenueCents)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No revenue data available yet. Once you start earning from course sales, this section will display your monthly revenue breakdown.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
