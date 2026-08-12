"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type { TopCourseRow, TopCourseSort } from "@/types/admin";

const SORT_OPTIONS: { value: TopCourseSort; label: string }[] = [
  { value: "students", label: "Students" },
  { value: "completions", label: "Completions" },
  { value: "revenue", label: "Revenue" },
  { value: "ratings", label: "Ratings" },
];

export function TopCoursesTable() {
  const [courses, setCourses] = useState<TopCourseRow[]>([]);
  const [sort, setSort] = useState<TopCourseSort>("students");
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics/courses/top", {
        params: { sort, limit: 20 },
      });
      setCourses(res.data.courses ?? []);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Top Courses</h3>
          <p className="text-sm text-slate-500 mt-0.5">Best performing courses on the platform</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as TopCourseSort)}
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
                  "Course",
                  "Instructor",
                  "Category",
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
              {courses.map((course, index) => (
                <tr key={course.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-bold text-[#0A4A3A]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900 max-w-[200px] truncate">
                    {course.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {course.instructorName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {course.categoryName}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatNumber(course.enrollments)}</td>
                  <td className="px-4 py-3 text-sm">{formatNumber(course.completions)}</td>
                  <td className="px-4 py-3 text-sm">{course.completionRate}%</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {formatCurrency(course.revenueCents)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {course.averageRating.toFixed(1)} ({course.reviewCount})
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
