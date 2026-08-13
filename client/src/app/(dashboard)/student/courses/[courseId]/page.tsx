"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { CourseReviewsSection } from "@/components/courses/CourseReviewsSection";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

interface LessonProgress {
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt: string | null;
}

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

interface EnrollmentDetail {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  enrolledAt: string;
  completedAt: string | null;
  progress: LessonProgress[];
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    averageRating?: number;
    reviewCount?: number;
    instructor?: { fullName: string };
    modules: Module[];
  };
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollment = useCallback(async () => {
  try {
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
      router.replace(`/courses/${courseId}`);
      return;
    }

    const detailRes = await api.get(`/enrollments/${match.id}`);
    return detailRes.data.enrollment || detailRes.data;
  } catch {
    throw new Error("Failed to load course details. Please try again.");
  }
}, [courseId, router]);

useEffect(() => {
  let cancelled = false;

  const loadEnrollment = async () => {
    try {
      const data = await fetchEnrollment();

      if (cancelled || !data) return;

      setEnrollment(data);
    } catch {
      if (!cancelled) {
        setError("Failed to load course details. Please try again.");
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  };

  void loadEnrollment();

  return () => {
    cancelled = true;
  };
}, [fetchEnrollment]);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-slate-50 animate-pulse p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-8 w-1/2 rounded bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !enrollment) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4">
          <p className="text-red-600 mb-4">{error || "Enrollment not found."}</p>
          <Link href="/student" className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const { course, progress: progressArray } = enrollment;
  const progressMap: Record<string, LessonProgress> = {};
  progressArray.forEach((p) => { progressMap[p.lessonId] = p; });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter(
    (l) => progressMap[l.id]?.status === "COMPLETED"
  ).length;
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const isCourseComplete = enrollment.status === "COMPLETED";

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Hero */}
        <div className="relative h-48 w-full sm:h-64 bg-slate-900 overflow-hidden">
          <Image
            src={course.thumbnailUrl || FALLBACK_IMAGE}
            alt={course.title}
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              {course.title}
            </h1>
            {course.instructor && (
              <p className="text-sm text-slate-300 mt-1">
                {course.instructor.fullName}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Progress summary */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {isCourseComplete ? "Course Completed! 🎉" : "Your Progress"}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {completedCount}/{totalLessons} lessons
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCourseComplete ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{progressPercent}% complete</p>
              </div>

              <div className="flex gap-3 shrink-0">
                {isCourseComplete ? (
                  <Link
                    href="/student/certificates"
                    className="rounded-lg border border-green-500 px-4 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                  >
                    View Certificate 🏆
                  </Link>
                ) : null}
                {/* Correct classroom route: /learn/[courseId] matching (classroom) group */}
                <Link
                  href={`/learn/${courseId}`}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {progressPercent === 0 ? "Start Course" : isCourseComplete ? "Review Course" : "Resume Course"}
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <CourseReviewsSection courseId={courseId} canSubmitReview />
          </div>

          {/* Curriculum */}
          <h2 className="text-xl font-bold text-slate-900 mb-4">Curriculum</h2>

          {course.modules.length > 0 ? (
            <div className="space-y-3">
              {course.modules.map((module) => (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm">{module.title}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {module.lessons.map((lesson) => {
                      const lp = progressMap[lesson.id];
                      const isDone = lp?.status === "COMPLETED";
                      const isInProgress = lp?.status === "IN_PROGRESS";

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${courseId}`}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
                        >
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? "bg-green-500 text-white"
                              : isInProgress
                              ? "bg-blue-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}>
                            {isDone ? "✓" : lesson.order}
                          </span>
                          <span className={`flex-1 text-sm ${isDone ? "text-slate-500 line-through" : "text-slate-800"}`}>
                            {lesson.title}
                          </span>
                          {lesson.durationSeconds && (
                            <span className="text-xs text-slate-400 shrink-0">
                              {Math.round(lesson.durationSeconds / 60)} min
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              The instructor is still building the curriculum for this course.
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}