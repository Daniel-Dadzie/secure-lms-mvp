"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/admin/formatters";
import type { InstructorCourse, InstructorStudent } from "@/types/instructor";

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        const res = await api.get("/courses/instructor/mine");
        if (!cancelled) setCourses(res.data.courses ?? []);
      } catch {
        // ignore
      }
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
        if (search.trim()) params.search = search.trim();
        const res = await api.get("/instructor/students", { params });
        if (!cancelled) {
          setStudents(res.data.students ?? []);
          setTotalPages(res.data.totalPages ?? 1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [page, courseId, search]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-1">Students enrolled in your courses.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
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
      </div>

      {loading ? (
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Course</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Progress</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">No students found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.enrollmentId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{s.fullName}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{s.courseTitle}</td>
                    <td className="px-4 py-3 text-slate-600">{s.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px]">
                          <div className="h-2 bg-[#196A54] rounded-full" style={{ width: `${s.progressPercent}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(s.enrolledAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
