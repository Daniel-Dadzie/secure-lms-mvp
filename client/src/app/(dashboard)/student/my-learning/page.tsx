"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { EmptyState } from "@/components/ui/EmptyState";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const GraduationCapIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

type TabFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

interface LessonProgress {
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt: string | null;
}

interface Enrollment {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  enrolledAt: string;
  lastAccessedAt?: string;
  progressPercent?: number;
  progressDetails?: {
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
  };
  lessonProgress?: LessonProgress[];
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    duration?: string;
    instructor?: { fullName: string };
    modules: { id: string; lessons: { id: string }[] }[];
  };
}

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 86400) return "Today";
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

function getProgressPercent(enrollment: Enrollment): number {
  if (enrollment.status === "COMPLETED") return 100;
  if (enrollment.progressDetails?.progressPercent != null) {
    return enrollment.progressDetails.progressPercent;
  }
  if (enrollment.progressPercent != null) return enrollment.progressPercent;

  const lessonProgress = enrollment.lessonProgress ?? [];
  const totalLessons = enrollment.course.modules.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0
  );
  if (totalLessons === 0) return 0;

  const completed = lessonProgress.filter((p) => p.status === "COMPLETED").length;
  return Math.round((completed / totalLessons) * 100);
}

export default function StudentMyCoursesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!isAuthenticated || user?.role !== "STUDENT") return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/enrollments");
        if (cancelled) return;
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.enrollments)
            ? raw.enrollments
            : [];
        setEnrollments(list);
      } catch {
        if (!cancelled) {
          setError("Failed to load your courses. Please try refreshing the page.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadData();
    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  const counts = useMemo(() => {
    const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
    const all = enrollments.length;
    return { ALL: all, COMPLETED: completed, IN_PROGRESS: all - completed };
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    if (activeTab === "ALL") return enrollments;
    if (activeTab === "COMPLETED") return enrollments.filter((e) => e.status === "COMPLETED");
    return enrollments.filter((e) => e.status !== "COMPLETED");
  }, [enrollments, activeTab]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Courses</h1>
        <p className="text-sm text-slate-500 mt-1">Track progress and continue where you left off.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {(["ALL", "IN_PROGRESS", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? "border-[#196A54] text-[#196A54] bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "ALL" ? "All" : tab === "IN_PROGRESS" ? "In Progress" : "Completed"} ({counts[tab]})
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No courses found"
          description={
            activeTab === "ALL"
              ? "Browse the catalog to enroll in your first course."
              : "No courses match this filter."
          }
          action={
            activeTab === "ALL" ? (
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-[#196A54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12503F]"
              >
                Browse Courses
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEnrollments.map((enrollment) => {
            const { course, status } = enrollment;
            const isCompleted = status === "COMPLETED";
            const progressPercent = getProgressPercent(enrollment);
            const completedLessons = enrollment.progressDetails?.completedLessons ?? 0;
            const totalLessons = enrollment.progressDetails?.totalLessons ?? course.modules.reduce(
              (sum, m) => sum + (m.lessons?.length ?? 0),
              0
            );

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow"
              >
                <Link href={`/learn/${course.id}`} className="shrink-0">
                  <div className="relative h-40 sm:h-32 w-full sm:w-56 rounded-xl overflow-hidden bg-slate-200">
                    <Image
                      src={course.thumbnailUrl || FALLBACK_IMAGE}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    {isCompleted && (
                      <div className="absolute inset-0 bg-[#196A54]/80 flex items-center justify-center">
                        <CheckIcon className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <Link href={`/student/courses/${course.id}`}>
                        <h2 className="text-lg font-bold text-slate-900 truncate hover:text-[#196A54]">
                          {course.title}
                        </h2>
                      </Link>
                      <p className="text-sm text-slate-500">
                        {course.instructor?.fullName} · {course.duration || "Self-paced"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isCompleted
                          ? "bg-teal-50 text-teal-700 border border-teal-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isCompleted && <CheckIcon className="w-3.5 h-3.5" />}
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-slate-600">
                        {completedLessons}/{totalLessons} lessons
                      </span>
                      <span className="text-sm font-bold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#196A54] rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Last accessed: {timeAgo(enrollment.lastAccessedAt || enrollment.enrolledAt)}
                    </span>

                    {isCompleted ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/student/courses/${course.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          Review
                        </Link>
                        <Link
                          href={`/student/certificates?courseId=${course.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#196A54] hover:bg-[#12503F]"
                        >
                          <GraduationCapIcon className="w-4 h-4" /> Certificate
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/learn/${course.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#196A54] hover:bg-[#12503F] shadow-sm"
                      >
                        Continue <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
