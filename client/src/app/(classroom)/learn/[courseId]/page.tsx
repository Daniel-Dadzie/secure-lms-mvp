"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

// --- Inline Icons ---
const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CircleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ArrowLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

interface Lesson {
  id: string;
  title: string;
  contentUrl?: string | null;
  durationSeconds: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  modules: Module[];
}

interface LessonProgressMap {
  [lessonId: string]: string;
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progressMap, setProgressMap] = useState<LessonProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch protected lesson content only through the authenticated lesson endpoint.
  // The public course catalogue provides lesson metadata but never contentUrl.
  const loadAuthorizedLesson = useCallback(
    async (moduleId: string, lesson: Lesson) => {
      try {
        const res = await api.get(
          `/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
        );

        const authorizedLesson = res.data?.lesson || res.data;

        setCurrentLesson({
          ...lesson,
          ...authorizedLesson,
        });
      } catch (err) {
        console.error("Failed to load authorized lesson:", err);

        setCurrentLesson({
          ...lesson,
          contentUrl: null,
        });
      }
    },
    [courseId]
  );

  // Fetch course catalogue, modules, lessons, and student progress
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/learn/${courseId}`);
      return;
    }

    let cancelled = false;

    async function fetchCourseData() {
      setIsLoading(true);
      setError(null);

      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        const courseData = courseRes.data?.course || courseRes.data;

        if (cancelled) return;

        if (!courseData?.access?.canPlayContent) {
          router.replace(`/courses/${courseId}`);
          return;
        }

        setCourse(courseData);

        const enrollmentsRes = await api.get("/enrollments");

        const enrollments = Array.isArray(enrollmentsRes.data)
          ? enrollmentsRes.data
          : enrollmentsRes.data?.enrollments || [];

        const currentEnrollment = enrollments.find(
          (e: { courseId?: string; course?: { id: string } }) =>
            e.courseId === courseId ||
            e.course?.id === courseId
        );

        const pMap: LessonProgressMap = {};

        if (
          currentEnrollment &&
          Array.isArray(currentEnrollment.progress)
        ) {
          currentEnrollment.progress.forEach((p: { lessonId: string; status: string }) => {
            pMap[p.lessonId] = p.status;
          });
        }

        setProgressMap(pMap);

        if (
          courseData?.modules &&
          courseData.modules.length > 0
        ) {
          const firstModule = courseData.modules[0];

          if (
            firstModule.lessons &&
            firstModule.lessons.length > 0
          ) {
            await loadAuthorizedLesson(
              firstModule.id,
              firstModule.lessons[0]
            );
          }
        }
      } catch (err) {
        console.error("Failed to load course player:", err);
        if (!cancelled) {
          setError("Failed to load course content. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchCourseData();

    return () => {
      cancelled = true;
    };
  }, [courseId, isAuthenticated, loadAuthorizedLesson, router]);

  // Handle marking a lesson as complete & advancing progress
  const handleToggleComplete = async (lessonId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);

    const currentStatus = progressMap[lessonId];
    const newStatus =
      currentStatus === "COMPLETED"
        ? "NOT_STARTED"
        : "COMPLETED";

    // Optimistic UI update
    setProgressMap((prev) => ({
      ...prev,
      [lessonId]: newStatus,
    }));

    try {
      await api.patch(`/progress/lessons/${lessonId}`, {
        status: newStatus,
        progressSeconds: 0,
      });
    } catch (err) {
      console.error("Failed to update lesson progress:", err);

      // Revert optimistic update on failure
      setProgressMap((prev) => ({
        ...prev,
        [lessonId]: currentStatus,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-400 mb-4">
          {error || "Course not found."}
        </p>

        <Link
          href="/student/my-learning"
          className="px-4 py-2 bg-teal-600 rounded-lg text-sm font-semibold hover:bg-teal-700 transition"
        >
          Return to My Learning
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/student/my-learning"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <span className="text-slate-700">|</span>

          <h1 className="text-base font-bold text-white truncate max-w-md">
            {course.title}
          </h1>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left Column: Video Player & Details */}
        <div className="lg:col-span-3 flex flex-col overflow-y-auto bg-slate-950 p-6">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
              {currentLesson?.contentUrl ? (
                <video
                  key={currentLesson.id}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  src={currentLesson.contentUrl}
                  onEnded={() => {
                    if (
                      progressMap[currentLesson.id] !== "COMPLETED"
                    ) {
                      handleToggleComplete(currentLesson.id);
                    }
                  }}
                  ref={(videoNode) => {
                    if (videoNode) {
                      videoNode.load();
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <p className="text-lg font-medium">
                    No video content available for this lesson.
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Please select another lesson or verify that you
                    are enrolled in this course.
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Title & Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Current Lesson
                </span>

                <h2 className="text-xl font-bold text-white mt-1">
                  {currentLesson?.title || "Select a lesson"}
                </h2>
              </div>

              {currentLesson && (
                <button
                  onClick={() =>
                    handleToggleComplete(currentLesson.id)
                  }
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${
                    progressMap[currentLesson.id] === "COMPLETED"
                      ? "bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900"
                      : "bg-[#115e59] text-white hover:bg-teal-700"
                  }`}
                >
                  <CheckCircleIcon className="w-4 h-4" />

                  {progressMap[currentLesson.id] === "COMPLETED"
                    ? "Completed"
                    : "Mark as Complete"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Course Curriculum Sidebar */}
        <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
            <h3 className="font-bold text-white text-sm tracking-wide uppercase">
              Course Content
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-slate-800">
            {course.modules?.map((module, mIndex) => (
              <div key={module.id} className="p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Module {mIndex + 1}: {module.title}
                </h4>

                <div className="flex flex-col gap-1">
                  {module.lessons?.map((lesson) => {
                    const isSelected =
                      currentLesson?.id === lesson.id;

                    const isCompleted =
                      progressMap[lesson.id] === "COMPLETED";

                    return (
                      <button
                        key={lesson.id}
                        onClick={() =>
                          loadAuthorizedLesson(
                            module.id,
                            lesson
                          )
                        }
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm ${
                          isSelected
                            ? "bg-teal-950/60 text-teal-300 font-medium border border-teal-800/50"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="shrink-0">
                          {isCompleted ? (
                            <CheckCircleIcon className="w-4 h-4 text-teal-400" />
                          ) : (
                            <CircleIcon className="w-4 h-4 text-slate-600" />
                          )}
                        </span>

                        <span className="truncate flex-1">
                          {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
