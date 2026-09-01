"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { CourseReviewsSection } from "@/components/courses/CourseReviewsSection";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

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

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number | null;
  averageRating?: number;
  reviewCount?: number;
  instructor?: { fullName: string };
  modules: Module[];
}

interface LessonProgress {
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

interface PageState {
  course: CourseDetail | null;
  isEnrolled: boolean;
  enrollmentId: string | null;
  progressArray: LessonProgress[];
  isLoading: boolean;
  error: string | null;
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [state, setState] = useState<PageState>({
    course: null,
    isEnrolled: false,
    enrollmentId: null,
    progressArray: [],
    isLoading: true,
    error: null,
  });

  const fetchCourseData = useCallback(async () => {
    try {
      const courseRes = await api.get(`/courses/${courseId}`);
      const courseData = courseRes.data.course || courseRes.data;

      let enrolled = false;
      let enrollId = null;
      let progress: LessonProgress[] = [];

      try {
        const enrollRes = await api.get("/enrollments");
        const rawData = enrollRes.data;
        const enrolledList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.enrollments)
          ? rawData.enrollments
          : [];

        const match = enrolledList.find(
          (e: { course?: { id: string }; courseId?: string }) =>
            (e.course?.id || e.courseId) === courseId
        );

        if (match) {
          enrolled = true;
          enrollId = match.id;
          const detailRes = await api.get(`/enrollments/${match.id}`);
          const detailData = detailRes.data.enrollment || detailRes.data;
          progress = detailData.progress || [];
        }
      } catch {
        // Safe to ignore if not enrolled
      }

      setState({
        course: courseData,
        isEnrolled: enrolled,
        enrollmentId: enrollId,
        progressArray: progress,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load course details. Please try again.",
      }));
    }
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cancelled) {
        await fetchCourseData();
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchCourseData]);

  const { course, isEnrolled, enrollmentId, progressArray, isLoading, error } = state;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-8 w-1/2 rounded bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-4">{error || "Course not found."}</p>
        <Link href="/student/courses" className="text-[#196A54] hover:underline text-sm font-semibold">
          ← Back to Student Courses
        </Link>
      </div>
    );
  }

  const progressMap: Record<string, LessonProgress> = {};
  progressArray.forEach((p) => { progressMap[p.lessonId] = p; });

  const allLessons = course.modules?.flatMap((m) => m.lessons) || [];
  const completedCount = allLessons.filter(
    (l) => progressMap[l.id]?.status === "COMPLETED"
  ).length;
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="pb-12">
      {/* Hero Header */}
      <div className="relative h-48 w-full sm:h-56 bg-slate-900 overflow-hidden">
        <Image
          src={course.thumbnailUrl || FALLBACK_IMAGE}
          alt={course.title}
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{course.title}</h1>
          {course.instructor && (
            <p className="text-sm text-slate-300 mt-1">Instructor: {course.instructor.fullName}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* Status / Action Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {isEnrolled ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Your Progress</span>
                    <span className="text-sm font-bold text-[#196A54]">{completedCount}/{totalLessons} lessons</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#196A54] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{progressPercent}% complete</p>
                </>
              ) : (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Recommended Course
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-2">
                    {course.price != null && course.price > 0 ? formatPrice(Math.round(course.price * 100)) : "Free"}
                  </p>
                </div>
              )}
            </div>

            <div>
              {isEnrolled ? (
                <Link
                  href={`/learn/${courseId}`}
                  className="inline-block rounded-xl bg-[#0A4A3A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#12503F] transition-colors"
                >
                  {progressPercent === 0 ? "Start Course" : progressPercent === 100 ? "Review Course" : "Resume Course"}
                </Link>
              ) : (
                <Link
                  href={`/cart?courseId=${courseId}`}
                  className="inline-block rounded-xl bg-[#0A4A3A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#12503F] transition-colors"
                >
                  Enroll Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">About This Course</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
        </div>

        {/* Reviews */}
        <CourseReviewsSection courseId={courseId} canSubmitReview={isEnrolled} />

        {/* Curriculum */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Curriculum</h2>
        {course.modules?.length > 0 ? (
          <div className="space-y-3">
            {course.modules.map((module) => (
              <div key={module.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">{module.title}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {module.lessons.map((lesson) => {
                    const lp = progressMap[lesson.id];
                    const isDone = lp?.status === "COMPLETED";

                    return (
                      <div key={lesson.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isDone ? "✓" : lesson.order}
                        </span>
                        <span className="flex-1 text-sm text-slate-800">{lesson.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No curriculum modules added yet.
          </div>
        )}
      </div>
    </div>
  );
}