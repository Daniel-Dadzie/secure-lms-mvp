"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type { TopInstructorRow, TopInstructorSort } from "@/types/admin";

const SORT_OPTIONS: { value: TopInstructorSort; label: string }[] = [
  { value: "completions", label: "Completions" },
  { value: "revenue", label: "Revenue" },
  { value: "ratings", label: "Ratings" },
];

export function TopInstructorsTable() {
  const [instructors, setInstructors] = useState<TopInstructorRow[]>([]);
  const [sort, setSort] = useState<TopInstructorSort>("completions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/admin/analytics/instructors/top", {
          params: { sort, limit: 20 },
        });
        if (!cancelled) {
          setInstructors(res.data.instructors ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [sort]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Best Instructors</h3>
          <p className="text-sm text-slate-500 mt-0.5">Top instructors by performance</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as TopInstructorSort)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort by {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "#",
                  "Instructor",
                  "Courses",
                  "Students",
                  "Completions",
                  "Completion %",
                  "Revenue",
                  "Rating",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instructors.map((inst, index) => (
                <tr key={inst.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-bold text-[#0A4A3A]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/instructors/${inst.id}`}
                      className="font-semibold text-[#196A54] hover:underline"
                    >
                      {inst.fullName}
                    </Link>
                    {inst.specialization && (
                      <p className="text-xs text-slate-500 mt-0.5">{inst.specialization}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{inst.courseCount}</td>
                  <td className="px-4 py-3 text-sm">{formatNumber(inst.enrollments)}</td>
                  <td className="px-4 py-3 text-sm">{formatNumber(inst.completions)}</td>
                  <td className="px-4 py-3 text-sm">{inst.completionRate}%</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {formatCurrency(inst.revenueCents)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {inst.averageRating.toFixed(1)} ({inst.reviewCount})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
