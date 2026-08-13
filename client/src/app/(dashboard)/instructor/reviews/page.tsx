"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/admin/formatters";
import type { InstructorCourse, InstructorReview } from "@/types/instructor";

export default function InstructorReviewsPage() {
  const [reviews, setReviews] = useState<InstructorReview[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

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

  async function reloadReviews() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (courseId) params.courseId = courseId;
      const res = await api.get("/instructor/reviews", { params });
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
        if (courseId) params.courseId = courseId;
        const res = await api.get("/instructor/reviews", { params });
        if (!cancelled) {
          setReviews(res.data.reviews ?? []);
          setTotalPages(res.data.totalPages ?? 1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [page, courseId]);

  async function submitReply(reviewId: string) {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) return;
    setSubmittingId(reviewId);
    try {
      await api.patch(`/instructor/reviews/${reviewId}/reply`, { reply });
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      await reloadReviews();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">View and reply to student reviews on your courses.</p>
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
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{review.user.fullName}</p>
                  <p className="text-xs text-slate-500">
                    <a href={`/courses/${review.course.id}`} className="text-[#196A54] hover:underline">
                      {review.course.title}
                    </a>
                    {" · "}
                    {formatDateTime(review.createdAt)}
                  </p>
                </div>
                <span className="text-amber-500 font-bold">{"★".repeat(review.rating)}</span>
              </div>
              {review.comment && <p className="text-sm text-slate-700">{review.comment}</p>}
              {review.instructorReply ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm">
                  <p className="font-semibold text-emerald-900 text-xs mb-1">Your reply</p>
                  <p className="text-emerald-800">{review.instructorReply}</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={replyDrafts[review.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                  />
                  <Button
                    size="sm"
                    isLoading={submittingId === review.id}
                    onClick={() => submitReply(review.id)}
                    disabled={!replyDrafts[review.id]?.trim()}
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
