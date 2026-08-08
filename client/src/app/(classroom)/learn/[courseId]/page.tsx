"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

interface Lesson {
  id: string;
  title: string;
  order: number;
  durationSeconds?: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface LessonProgressItem {
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressSeconds: number;
  completedAt: string | null;
}

interface EnrollmentDetail {
  id: string;
  status: string;
  course: {
    id: string;
    title: string;
    modules: Module[];
  };
  progress: LessonProgressItem[];
}

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { isAuthenticated } = useAuthStore();

  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEnrollment = useCallback(async () => {
    try {
      // Get all enrollments, find the one matching this course
      const res = await api.get("/enrollments");
      const rawData = res.data;
      const enrolledList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.enrollments)
        ? rawData.enrollments
        : [];

      const match = enrolledList.find(
        (e: any) => (e.course?.id || e.courseId) === courseId
      );

      if (!match) {
        // Not enrolled — redirect to the course detail page
        router.replace(`/courses/${courseId}`);
        return;
      }

      // Fetch full enrollment detail (includes per-lesson progress array)
      const detailRes = await api.get(`/enrollments/${match.id}`);
      const detail = detailRes.data.enrollment || detailRes.data;
      setEnrollment(detail);

      // Auto-select first incomplete lesson, or first lesson if all done
      const allLessons = detail.course?.modules?.flatMap((m: Module) => m.lessons) ?? [];
      const progressMap: Record<string, string> = {};
      (detail.progress as LessonProgressItem[]).forEach((p) => {
        progressMap[p.lessonId] = p.status;
      });

      const firstIncomplete = allLessons.find(
        (l: Lesson) => progressMap[l.id] !== "COMPLETED"
      );
      setActiveLessonId(firstIncomplete?.id ?? allLessons[0]?.id ?? null);
    } catch (err: any) {
      setError("Could not load your course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // This effect intentionally starts an async data fetch.
      // The fetch function updates component state when the request completes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchEnrollment();
    }
  }, [isAuthenticated, fetchEnrollment]);

  const handleMarkComplete = async () => {
    if (!activeLessonId) return;
    setIsMarkingComplete(true);
    try {
      // Correct endpoint: PATCH /progress/lessons/:lessonId
      // with status and progressSeconds in the body
      await api.patch(`/progress/lessons/${activeLessonId}`, {
        status: "COMPLETED",
        progressSeconds: 0,
      });
      showToast("Lesson marked as complete ✓");
      // Refresh enrollment data so progress updates immediately
      await fetchEnrollment();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Could not mark lesson complete.");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleMarkInProgress = async () => {
    if (!activeLessonId) return;
    try {
      await api.patch(`/progress/lessons/${activeLessonId}`, {
        status: "IN_PROGRESS",
        progressSeconds: 0,
      });
    } catch {
      // Non-critical, don't show error for this
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex min-h-screen items-center justify-center bg-slate-900">
          <p className="text-slate-400 animate-pulse">Loading your course...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !enrollment) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white px-4">
          <p className="text-red-400 mb-6">{error || "Course not found."}</p>
          <Link href="/student" className="text-blue-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
  const progressMap: Record<string, LessonProgressItem> = {};
  enrollment.progress.forEach((p) => { progressMap[p.lessonId] = p; });

  const completedCount = allLessons.filter(
    (l) => progressMap[l.id]?.status === "COMPLETED"
  ).length;
  const totalLessons = allLessons.length;
  // Compute progress client-side from real data, not a field that doesn't exist
  const progressPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const activeLessonProgress = activeLessonId ? progressMap[activeLessonId] : null;
  const isActiveComplete = activeLessonProgress?.status === "COMPLETED";

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="flex min-h-screen flex-col bg-slate-900 text-white">
        {toast && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}

        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3 shrink-0">
          <Link
            href="/student"
            className="text-sm text-slate-400 hover:text-white transition flex items-center gap-2"
          >
            ← Dashboard
          </Link>
          <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {enrollment.course.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {completedCount}/{totalLessons} lessons
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{progressPercent}%</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — lesson list */}
          <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-700 bg-slate-800 lg:flex">
            {enrollment.course.modules.map((module) => (
              <div key={module.id} className="border-b border-slate-700">
                <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {module.title}
                </div>
                {module.lessons.map((lesson) => {
                  const lessonProgress = progressMap[lesson.id];
                  const isDone = lessonProgress?.status === "COMPLETED";
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonId(lesson.id);
                        if (!isDone) handleMarkInProgress();
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-slate-600 text-slate-300"
                      }`}>
                        {isDone ? "✓" : lesson.order}
                      </span>
                      <span className="line-clamp-2">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Main content area */}
          <main className="flex flex-1 flex-col overflow-y-auto">
            {activeLesson ? (
              <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {activeLesson.title}
                  </h2>
                  {activeLesson.durationSeconds && (
                    <p className="mt-1 text-sm text-slate-400">
                      {Math.round(activeLesson.durationSeconds / 60)} min
                    </p>
                  )}
                </div>

                {/* Video/content placeholder — replace with real video player
                    once videoUrl is available on the lesson from the backend */}
                <div className="mb-8 flex aspect-video w-full items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-center text-slate-500">
                    <div className="text-5xl mb-3">▶</div>
                    <p className="text-sm">Video content coming soon</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {isActiveComplete ? (
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <span>✓</span>
                      <span>Lesson completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      disabled={isMarkingComplete}
                      className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
                    >
                      {isMarkingComplete ? "Marking..." : "Mark as Complete"}
                    </button>
                  )}

                  {enrollment.status === "COMPLETED" && (
                    <Link
                      href="/student/certificates"
                      className="rounded-lg border border-green-500 px-5 py-3 text-sm font-semibold text-green-400 transition hover:bg-green-500/10"
                    >
                      View Certificate 🏆
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-slate-500">
                <p>Select a lesson to begin.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}