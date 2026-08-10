"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { EmptyState } from "@/components/ui/EmptyState";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

// --- Inline SVG Icons ---
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

const EmptyBookIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// --- Types ---
type TabFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

interface LessonProgress {
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt: string | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: { id: string }[];
}

interface Enrollment {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  enrolledAt: string;
  lastAccessedAt?: string;
  progress: LessonProgress[];
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    duration?: string;
    instructor?: { fullName: string };
    modules: Module[];
  };
}

// --- Utility Functions ---
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

// --- Main Page Component ---
export default function StudentMyCoursesPage() {
  const { isAuthenticated, user } = useAuthStore();
  
  // State
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  const fetchEnrollments = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "STUDENT") return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/enrollments");
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.enrollments) ? raw.enrollments : [];
      setEnrollments(list);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError("Failed to load your courses. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let isMounted = true;

    const fetchEnrollments = async () => {
      if (!isAuthenticated || user?.role !== "STUDENT") return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await api.get("/enrollments");
        if (!isMounted) return;
        
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.enrollments) ? raw.enrollments : [];
        setEnrollments(list);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch enrollments:", err);
        setError("Failed to load your courses. Please try refreshing the page.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEnrollments();

    // Cleanup function prevents state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Derived State: Computed efficiently using useMemo
  const counts = useMemo(() => {
    const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
    const all = enrollments.length;
    return {
      ALL: all,
      COMPLETED: completed,
      IN_PROGRESS: all - completed,
    };
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    if (activeTab === "ALL") return enrollments;
    if (activeTab === "COMPLETED") return enrollments.filter((e) => e.status === "COMPLETED");
    return enrollments.filter((e) => e.status !== "COMPLETED");
  }, [enrollments, activeTab]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2fafa] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="flex gap-4 mb-8">
          <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full bg-white rounded-xl border border-teal-50 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fafa] pb-20 relative">
      <main className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Courses</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "ALL"
                ? "border-[#115e59] text-[#115e59] bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "IN_PROGRESS"
                ? "border-[#115e59] text-[#115e59] bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            In Progress ({counts.IN_PROGRESS})
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "COMPLETED"
                ? "border-[#115e59] text-[#115e59] bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Completed ({counts.COMPLETED})
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Course List */}
        {!isLoading && enrollments.length === 0 && !error ? (
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-teal-50">
            <EmptyState
              icon={<EmptyBookIcon className="w-12 h-12 text-slate-300 mx-auto" />}
              title="You aren't enrolled in any courses yet"
              description="Explore our catalog to find your next skill and start learning today."
              action={
                <Link
                  href="/student/courses"
                  className="inline-flex items-center justify-center rounded-lg bg-[#115e59] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                >
                  Browse Catalog
                </Link>
              }
            />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">No courses found in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredEnrollments.map((enrollment) => {
              const { course, progress, status } = enrollment;
              const isCompleted = status === "COMPLETED";
              
              // 1. Safely parse progress (fallback to empty array if backend omits it)
              const safeProgress = Array.isArray(progress) ? progress : [];
              const progressMap = new Map(safeProgress.map(p => [p.lessonId, p.status]));
              
              // 2. Safely parse modules and lessons
              const safeModules = Array.isArray(course?.modules) ? course.modules : [];
              const allLessons = safeModules.flatMap(m => Array.isArray(m.lessons) ? m.lessons : []);
              
              // 3. Calculate math
              const totalLessons = allLessons.length;
              const completedLessons = allLessons.filter(l => progressMap.get(l.id) === "COMPLETED").length;
              const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              let nextActionText = "Start Course";
              if (isCompleted) {
                nextActionText = "All lessons completed!";
              } else if (progressPercent > 0 && safeModules.length > 0) {
                // Find the first module that isn't fully completed
                const currentModule = safeModules.find(m => 
                  Array.isArray(m.lessons) && m.lessons.some(l => progressMap.get(l.id) !== "COMPLETED")
                );
                if (currentModule) {
                  nextActionText = `Next: ${currentModule.title}`;
                } else {
                  nextActionText = "Resume Course";
                }
              }

              const lastAccessed = enrollment.lastAccessedAt || enrollment.enrolledAt;

              return (
                <div 
                  key={enrollment.id} 
                  className="bg-white rounded-xl border border-teal-50 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col sm:flex-row gap-5 focus-within:ring-2 focus-within:ring-teal-600"
                >
                  {/* Thumbnail */}
                  <Link href={`/learn/${course.id}`} className="shrink-0 focus:outline-none">
                    <div className="relative h-40 sm:h-32 w-full sm:w-56 rounded-lg overflow-hidden bg-slate-200 group">
                      <Image
                        src={course.thumbnailUrl || FALLBACK_IMAGE}
                        alt={`Thumbnail for ${course.title}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 224px"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      {isCompleted && (
                        <div className="absolute inset-0 bg-[#115e59]/80 flex items-center justify-center backdrop-blur-[2px]">
                          <CheckIcon className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content Body */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <Link href={`/learn/${course.id}`} className="focus:outline-none focus:underline decoration-teal-600 underline-offset-2">
                          <h2 className="text-lg font-bold text-slate-900 truncate pr-4">{course.title}</h2>
                        </Link>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {course.instructor?.fullName} <span className="mx-1.5 font-bold">·</span> {course.duration || "Self-paced"} total
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
                            <CheckIcon className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Area */}
                    <div className="mt-auto pt-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-slate-600 truncate pr-4">{nextActionText}</span>
                        <span className="text-sm font-bold text-slate-900">{progressPercent}%</span>
                      </div>
                      
                      {/* Progress Bar Track */}
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div 
                          className="h-full bg-[#115e59] rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-medium">
                        Last accessed: {timeAgo(lastAccessed)}
                      </span>
                      
                      {isCompleted ? (
                        <Link
                          href={`/student/certificates/${course.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
                        >
                          <GraduationCapIcon className="w-4 h-4 text-slate-500" /> Certificate
                        </Link>
                      ) : (
                        <Link
                          href={`/learn/${course.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#115e59] hover:bg-teal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 shadow-sm"
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
      </main>
      <FloatingFAQAssistant />
    </div>
  );
}