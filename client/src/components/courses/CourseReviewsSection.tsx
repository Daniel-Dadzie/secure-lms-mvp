"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import type { CourseReview, CourseReviewsResponse } from "@/types/course";

interface CourseReviewsSectionProps {
  courseId: string;
  canSubmitReview?: boolean;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${starClass} ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total }: { label: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-slate-500">{label}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-slate-500">{count}</span>
    </div>
  );
}

export function CourseReviewsSection({ courseId, canSubmitReview = false }: CourseReviewsSectionProps) {
  const { user } = useAuthStore();
  const [data, setData] = useState<CourseReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const myReview = data?.myReview ?? data?.reviews.find((r) => r.userId === user?.id);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${courseId}/reviews`, { params: { page, limit: 10 } });
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [courseId, page]);

  async function reloadReviews() {
    const res = await api.get(`/courses/${courseId}/reviews`, { params: { page, limit: 10 } });
    setData(res.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (myReview) {
        await api.patch(`/courses/${courseId}/reviews/${myReview.id}`, {
          rating,
          comment: comment.trim() || undefined,
        });
      } else {
        await api.post(`/courses/${courseId}/reviews`, {
          rating,
          comment: comment.trim() || undefined,
        });
      }
      setShowForm(false);
      await reloadReviews();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not save review.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditForm() {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? "");
    }
    setShowForm(true);
  }

  if (loading && !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse h-48" />
    );
  }

  const total = data?.totalReviews ?? 0;
  const distribution = data?.distribution;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Student Reviews
        </h3>
        {canSubmitReview && user?.role === "STUDENT" && !myReview && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
        {canSubmitReview && user?.role === "STUDENT" && myReview && !showForm && (
          <Button size="sm" variant="outline" onClick={openEditForm}>
            Edit Your Review
          </Button>
        )}
      </div>

      {total > 0 && data && (
        <div className="grid sm:grid-cols-[140px_1fr] gap-6 pb-6 border-b border-slate-100">
          <div className="text-center sm:text-left">
            <p className="text-4xl font-extrabold text-slate-900">{data.averageRating.toFixed(1)}</p>
            <StarRating rating={Math.round(data.averageRating)} size="lg" />
            <p className="text-xs text-slate-500 mt-1">{total} review{total !== 1 ? "s" : ""}</p>
          </div>
          {distribution && (
            <div className="space-y-1.5">
              <RatingBar label={5} count={distribution.fiveStar} total={total} />
              <RatingBar label={4} count={distribution.fourStar} total={total} />
              <RatingBar label={3} count={distribution.threeStar} total={total} />
              <RatingBar label={2} count={distribution.twoStar} total={total} />
              <RatingBar label={1} count={distribution.oneStar} total={total} />
            </div>
          )}
        </div>
      )}

      {showForm && canSubmitReview && user?.role === "STUDENT" && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-900">
            {myReview ? "Update your review" : "Share your experience"}
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What did you think of this course?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" isLoading={submitting}>
              {myReview ? "Update Review" : "Submit Review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!data || data.reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet. Be the first to share your feedback.</p>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review: CourseReview) => (
            <div key={review.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{review.user.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
              )}
              {review.instructorReply && (
                <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">Instructor response</p>
                  <p className="text-sm text-emerald-900">{review.instructorReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500 self-center">
            Page {page} of {data.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
