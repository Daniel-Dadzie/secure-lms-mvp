"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import type { InstructorCourse, InstructorPurchase } from "@/types/instructor";

export default function InstructorEarningsPage() {
  const [purchases, setPurchases] = useState<InstructorPurchase[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [summary, setSummary] = useState({ totalRevenueCents: 0, totalPurchases: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");

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
        const params: Record<string, string | number> = { page, limit: 20 };
        if (courseId) params.courseId = courseId;
        const res = await api.get("/instructor/earnings", { params });
        if (!cancelled) {
          setPurchases(res.data.purchases ?? []);
          setTotalPages(res.data.totalPages ?? 1);
          setSummary(res.data.summary ?? { totalRevenueCents: 0, totalPurchases: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [page, courseId]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">Revenue from completed course purchases.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(summary.totalRevenueCents)} />
        <StatCard label="Total Purchases" value={summary.totalPurchases} />
      </div>

      <select
        value={courseId}
        onChange={(e) => { setCourseId(e.target.value); setPage(1); }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">All courses</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      {loading ? (
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Course</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Coupon</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">No purchases yet.</td></tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-900">{p.course.title}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.user.fullName}</p>
                      <p className="text-xs text-slate-500">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.coupon?.code ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.finalAmountCents)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
