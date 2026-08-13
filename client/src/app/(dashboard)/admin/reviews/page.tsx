"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/admin/formatters";
import type { AdminReview } from "@/types/admin";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [visibleFilter, setVisibleFilter] = useState<string>("");

  async function reloadReviews() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (visibleFilter) params.visible = visibleFilter;
      const res = await api.get("/admin/reviews", { params });
      setReviews(res.data.reviews ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 20 };
        if (visibleFilter) params.visible = visibleFilter;
        const res = await api.get("/admin/reviews", { params });
        if (!cancelled) {
          setReviews(res.data.reviews ?? []);
          setTotalPages(res.data.totalPages ?? 1);
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
  }, [page, visibleFilter]);

  async function toggleVisibility(review: AdminReview) {
    if (review.isVisible) {
      await api.patch(`/admin/reviews/${review.id}/hide`);
    } else {
      await api.patch(`/admin/reviews/${review.id}/restore`);
    }
    reloadReviews();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Moderate course reviews across the platform.</p>
      </div>

      <select
        value={visibleFilter}
        onChange={(e) => { setVisibleFilter(e.target.value); setPage(1); }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">All reviews</option>
        <option value="true">Visible</option>
        <option value="false">Hidden</option>
      </select>

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Course", "Reviewer", "Rating", "Comment", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm font-medium">{r.course.title}</td>
                    <td className="px-4 py-3 text-sm">{r.user.fullName}</td>
                    <td className="px-4 py-3 text-sm">{r.rating}/5</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{r.comment ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant={r.isVisible ? "green" : "red"}>{r.isVisible ? "Visible" : "Hidden"}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => toggleVisibility(r)}>
                        {r.isVisible ? "Hide" : "Restore"}
                      </Button>
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
