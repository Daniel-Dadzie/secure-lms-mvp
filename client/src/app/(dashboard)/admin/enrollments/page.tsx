"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/admin/formatters";
import type { AdminEnrollment } from "@/types/admin";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/enrollments", { params: { page, limit: 20 } });
      setEnrollments(res.data.enrollments ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  async function handleManualEnroll(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/admin/enrollments", { userId, courseId });
    setShowEnrollForm(false);
    setUserId("");
    setCourseId("");
    fetchEnrollments();
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this enrollment?")) return;
    await api.patch(`/admin/enrollments/${id}/cancel`);
    fetchEnrollments();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Enrollments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage student course enrollments.</p>
        </div>
        <Button className="bg-[#0A4A3A]" onClick={() => setShowEnrollForm(true)}>Manual Enroll</Button>
      </div>

      {showEnrollForm && (
        <form onSubmit={handleManualEnroll} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="flex-1 rounded-lg border px-3 py-2 text-sm" required />
          <input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Course ID" className="flex-1 rounded-lg border px-3 py-2 text-sm" required />
          <Button type="submit">Enroll</Button>
          <Button type="button" variant="outline" onClick={() => setShowEnrollForm(false)}>Cancel</Button>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Student", "Course", "Status", "Enrolled", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-sm">{e.user.fullName}</td>
                    <td className="px-4 py-3 text-sm">{e.course.title}</td>
                    <td className="px-4 py-3"><Badge variant={e.status === "ACTIVE" ? "green" : "slate"}>{e.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(e.enrolledAt)}</td>
                    <td className="px-4 py-3">
                      {e.status === "ACTIVE" && (
                        <Button size="sm" variant="outline" onClick={() => handleCancel(e.id)}>Cancel</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
