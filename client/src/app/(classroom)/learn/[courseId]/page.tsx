"use client";

import React, { useState, useEffect, use, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Video, FileText } from "lucide-react";

const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CircleIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ArrowLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

interface Lesson {
  id: string;
  title: string;
  contentType: "VIDEO" | "TEXT";
  contentUrl?: string | null;
  contentText?: string | null;
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
  slug: string;
  modules: Module[];
}

interface LessonProgressMap {
  [lessonId: string]: string;
}

interface LessonProgressItem {
  lessonId: string;
  status: string;
  progressSeconds?: number;
}

function findResumeLesson(
  modules: Module[],
  progressMap: LessonProgressMap
): { moduleId: string; lesson: Lesson } | null {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  for (const mod of sortedModules) {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
    for (const lesson of sortedLessons) {
      if (progressMap[lesson.id] !== "COMPLETED") {
        return { moduleId: mod.id, lesson };
      }
    }
  }

  const firstModule = sortedModules[0];
  const firstLesson = firstModule?.lessons?.sort((a, b) => a.order - b.order)[0];
  if (firstModule && firstLesson) {
    return { moduleId: firstModule.id, lesson: firstLesson };
  }

  return null;
}

function findNextLesson(
  modules: Module[],
  currentLessonId: string
): { moduleId: string; lesson: Lesson } | null {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  let foundCurrent = false;

  for (const mod of sortedModules) {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
    for (const lesson of sortedLessons) {
      if (foundCurrent) {
        return { moduleId: mod.id, lesson };
      }
      if (lesson.id === currentLessonId) {
        foundCurrent = true;
      }
    }
  }

  return null;
}

function CourseCompletionOverlay({
  courseTitle,
  courseId,
  onClose,
}: {
  courseTitle: string;
  courseId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-complete-title"
        className="relative w-full max-w-md rounded-2xl border border-[#C2F25B]/30 bg-gradient-to-b from-[#0A4A3A] to-[#062E24] p-8 shadow-2xl text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C2F25B]/20 text-3xl">
          🎉
        </div>
        <h2
          id="course-complete-title"
          className="text-2xl font-extrabold text-white"
        >
          Congratulations!
        </h2>
        <p className="mt-2 text-sm text-teal-100/80">
          You&apos;ve completed{" "}
          <span className="font-semibold text-white">{courseTitle}</span>.
          Your certificate is ready.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/student/certificates?courseId=${courseId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2F25B] px-5 py-3 text-sm font-bold text-[#0A4A3A] hover:bg-[#d4f76e] transition"
          >
            View Certificate
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Go to Home
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs font-medium text-teal-100/60 hover:text-teal-100 transition"
        >
          Continue reviewing course
        </button>
      </div>
    </div>
  );
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseIdOrSlug = resolvedParams.courseId;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [resolvedCourseId, setResolvedCourseId] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progressMap, setProgressMap] = useState<LessonProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [videoWatchTime, setVideoWatchTime] = useState<Record<string, number>>(() => ({}));
  const [currentVideoTime, setCurrentVideoTime] = useState(() => 0);
  const [lastSaveTime, setLastSaveTime] = useState(() => Date.now());
  const currentLessonRef = useRef<Lesson | null>(null);

  const loadAuthorizedLesson = useCallback(
    async (moduleId: string, lesson: Lesson) => {
      const id = resolvedCourseId ?? courseIdOrSlug;
      try {
        const res = await api.get(
          `/courses/${id}/modules/${moduleId}/lessons/${lesson.id}`
        );
        const authorizedLesson = res.data?.lesson || res.data;
        setCurrentLesson({ ...lesson, ...authorizedLesson });
      } catch (err) {
        console.error("Failed to load authorized lesson:", err);
        setCurrentLesson({ ...lesson, contentUrl: null });
      }
    },
    [courseIdOrSlug, resolvedCourseId]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/learn/${courseIdOrSlug}`);
      return;
    }

    let cancelled = false;

    async function fetchCourseData() {
      setIsLoading(true);
      setError(null);

      try {
        const courseRes = await api.get(`/courses/${courseIdOrSlug}`);
        const courseData = courseRes.data?.course || courseRes.data;

        if (cancelled) return;

        if (!courseData?.access?.canPlayContent) {
          router.replace(`/courses/${courseData?.id ?? courseIdOrSlug}`);
          return;
        }

        setCourse(courseData);
        setResolvedCourseId(courseData.id);

        const enrollmentsRes = await api.get("/enrollments");
        const enrollments = Array.isArray(enrollmentsRes.data)
          ? enrollmentsRes.data
          : enrollmentsRes.data?.enrollments || [];

        const currentEnrollment = enrollments.find(
          (e: { courseId?: string; course?: { id: string } }) =>
            e.courseId === courseData.id || e.course?.id === courseData.id
        );

        const pMap: LessonProgressMap = {};
        const lessonProgress: LessonProgressItem[] =
          currentEnrollment?.lessonProgress ??
          (Array.isArray(currentEnrollment?.progress)
            ? currentEnrollment.progress
            : []);

        lessonProgress.forEach((p) => {
          pMap[p.lessonId] = p.status;
        });

        setProgressMap(pMap);

        if (courseData?.modules?.length > 0) {
          const resume = findResumeLesson(courseData.modules, pMap);
          if (resume) {
            await loadAuthorizedLesson(resume.moduleId, resume.lesson);
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
  }, [courseIdOrSlug, isAuthenticated, loadAuthorizedLesson, router]);

  const progressStats = useMemo(() => {
    if (!course?.modules) return { completed: 0, total: 0, percent: 0 };

    const allLessons = course.modules.flatMap((m) => m.lessons ?? []);
    const total = allLessons.length;
    const completed = allLessons.filter((l) => progressMap[l.id] === "COMPLETED").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percent };
  }, [course, progressMap]);

  const handleToggleComplete = async (lessonId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    const currentStatus = progressMap[lessonId];
    const newStatus = currentStatus === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";

    let courseJustCompleted = false;
    if (newStatus === "COMPLETED" && course) {
      const allLessons = course.modules.flatMap((m) => m.lessons ?? []);
      const completedAfter = allLessons.filter(
        (l) => l.id === lessonId || progressMap[l.id] === "COMPLETED"
      ).length;
      courseJustCompleted = completedAfter === allLessons.length;
    }

    setProgressMap((prev) => ({ ...prev, [lessonId]: newStatus }));

    try {
      // Use accumulated watch time for this lesson
      const accumulatedTime = videoWatchTime[lessonId] || 0;
      await api.patch(`/progress/lessons/${lessonId}`, {
        status: newStatus,
        progressSeconds: accumulatedTime,
      });
      if (courseJustCompleted) {
        setShowCompletionOverlay(true);
      }
    } catch (err) {
      console.error("Failed to update lesson progress:", err);
      setProgressMap((prev) => ({ ...prev, [lessonId]: currentStatus }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVideoTimeUpdate = (lessonId: string, currentTime: number) => {
    setCurrentVideoTime(currentTime);
    const now = Date.now();

    // Only accumulate time if at least 1 second has passed since last save
    if (lastSaveTime > 0 && now - lastSaveTime >= 1000) {
      setVideoWatchTime((prev) => ({
        ...prev,
        [lessonId]: Math.floor((prev[lessonId] || 0) + 1), // Increment by 1 second
      }));
      setLastSaveTime(now);
    }
  };

  // Update ref when current lesson changes
  useEffect(() => {
    currentLessonRef.current = currentLesson;
  }, [currentLesson]);

  // Save progress periodically (every 30 seconds)
  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(() => {
      if (cancelled) return;

      const lesson = currentLessonRef.current;
      if (!lesson) return;

      const accumulatedTime = videoWatchTime[lesson.id] || 0;
      if (accumulatedTime === 0) return; // Don't save if no time accumulated

      async function saveProgress() {
        if (cancelled) return;

        try {
          if (lesson) {
            await api.patch(`/progress/lessons/${lesson.id}`, {
              status: "IN_PROGRESS",
              progressSeconds: accumulatedTime,
            });
          }
        } catch (err) {
          console.error("Failed to save video progress:", err);
        }
      }

      void saveProgress();
    }, 30000); // Save every 30 seconds

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [videoWatchTime]);

  const goToNextLesson = useCallback(() => {
    if (!course || !currentLesson) return;

    const next = findNextLesson(course.modules, currentLesson.id);
    if (next) {
      void loadAuthorizedLesson(next.moduleId, next.lesson);
    }
  }, [course, currentLesson, loadAuthorizedLesson]);

  const nextLesson = useMemo(() => {
    if (!course || !currentLesson) return null;
    return findNextLesson(course.modules, currentLesson.id);
  }, [course, currentLesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A4A3A] flex flex-col items-center justify-center text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C2F25B]" />
        <p className="text-sm text-teal-100">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0A4A3A] flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-300 mb-4">{error || "Course not found."}</p>
        <Link
          href="/student/my-learning"
          className="px-4 py-2 bg-[#196A54] rounded-lg text-sm font-semibold hover:bg-[#12503F] transition"
        >
          Return to My Learning
        </Link>
      </div>
    );
  }

  const isCurrentComplete = currentLesson && progressMap[currentLesson.id] === "COMPLETED";
  const courseId = resolvedCourseId ?? course.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {showCompletionOverlay && (
        <CourseCompletionOverlay
          courseTitle={course.title}
          courseId={courseId}
          onClose={() => setShowCompletionOverlay(false)}
        />
      )}
      {/* Top bar with progress */}
      <header className="border-b border-slate-800 bg-[#0A4A3A] shrink-0">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/student/my-learning"
              className="p-2 rounded-lg text-teal-100/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Back to My Learning"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold text-teal-100/80">
              {progressStats.completed}/{progressStats.total} lessons
            </span>
            <div className="w-24 sm:w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C2F25B] rounded-full transition-all duration-500"
                style={{ width: `${progressStats.percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#C2F25B] w-8 text-right">
              {progressStats.percent}%
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">
        {/* Main content — uses full width beside sidebar on large screens */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 min-w-0">
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
            {/* Video/Text + progress stack — shared width */}
            <div className="w-full flex flex-col gap-3">
              {currentLesson?.contentType === "VIDEO" ? (
                <div className="relative aspect-video w-full bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                  {currentLesson?.contentUrl ? (
                    <video
                      key={currentLesson.id}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-contain"
                      src={currentLesson.contentUrl}
                      onTimeUpdate={() => {
                        if (currentLesson) {
                          handleVideoTimeUpdate(currentLesson.id, currentVideoTime);
                        }
                      }}
                      onEnded={() => {
                        if (progressMap[currentLesson.id] !== "COMPLETED") {
                          void handleToggleComplete(currentLesson.id);
                        }
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
                      <PlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mb-3" />
                      <p className="text-sm sm:text-base font-medium text-slate-400">
                        No video content for this lesson
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Mark the lesson complete when you&apos;re done reviewing the material.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                  <div
                    className="p-4 sm:p-6 md:p-8 prose prose-invert prose-slate max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: currentLesson?.contentText || "No content available for this lesson."
                    }}
                  />
                </div>
              )}

              {/* Course progress tracker — matches player width */}
              <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Course Progress</span>
                  <span className="text-slate-300 normal-case">
                    {progressStats.completed}/{progressStats.total} lessons ·{" "}
                    <span className="text-[#C2F25B]">{progressStats.percent}%</span>
                  </span>
                </div>
                <div className="relative h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden w-full">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#196A54] to-[#C2F25B] rounded-full transition-all duration-700"
                    style={{ width: `${progressStats.percent}%` }}
                  />
                  {[25, 50, 75].map((m) => (
                    <div
                      key={m}
                      className="absolute top-0 bottom-0 w-px bg-slate-700/80"
                      style={{ left: `${m}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 px-0.5">
                  {[25, 50, 75, 100].map((m) => (
                    <span
                      key={m}
                      className={`text-[9px] sm:text-[10px] font-medium ${
                        progressStats.percent >= m ? "text-[#C2F25B]" : "text-slate-600"
                      }`}
                    >
                      {m}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lesson info & actions */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2F25B]">
                    Current Lesson
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1 break-words">
                    {currentLesson?.title || "Select a lesson"}
                  </h2>
                  {currentLesson?.durationSeconds ? (
                    <p className="text-xs text-slate-400 mt-1">
                      {Math.round(currentLesson.durationSeconds / 60)} min
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {currentLesson && (
                    <button
                      onClick={() => void handleToggleComplete(currentLesson.id)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                        isCurrentComplete
                          ? "bg-teal-950 text-teal-300 border border-teal-700 hover:bg-teal-900"
                          : "bg-[#196A54] text-white hover:bg-[#12503F]"
                      }`}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {isCurrentComplete ? "Completed" : "Mark Complete"}
                    </button>
                  )}
                  {currentLesson && isCurrentComplete && nextLesson && (
                    <button
                      onClick={goToNextLesson}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#C2F25B] text-[#0A4A3A] hover:bg-[#d4f76e] transition shadow-sm"
                    >
                      Next Lesson
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  )}
                  {currentLesson && !isCurrentComplete && nextLesson && (
                    <button
                      onClick={goToNextLesson}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                    >
                      Skip to Next
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="w-full flex flex-wrap gap-3 pb-2 sm:pb-4">
              <Link
                href={`/student/courses/${resolvedCourseId ?? course.id}`}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
              >
                Course overview & reviews →
              </Link>
              {progressStats.percent === 100 && (
                <Link
                  href={`/student/certificates?courseId=${resolvedCourseId ?? course.id}`}
                  className="text-xs font-semibold text-[#C2F25B] hover:text-yellow-300 transition"
                >
                  View your certificate →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum sidebar */}
        <aside className="w-full xl:w-80 2xl:w-96 shrink-0 bg-slate-900 border-t xl:border-t-0 xl:border-l border-slate-800 flex flex-col max-h-[40vh] sm:max-h-[45vh] xl:max-h-none xl:h-[calc(100vh-3.5rem)]">
          <div className="p-4 border-b border-slate-800 shrink-0">
            <h3 className="font-bold text-white text-sm">Course Content</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {progressStats.completed} of {progressStats.total} lessons completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {[...course.modules]
              .sort((a, b) => a.order - b.order)
              .map((mod, mIndex) => {
                const modLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
                const modCompleted = modLessons.filter(
                  (l) => progressMap[l.id] === "COMPLETED"
                ).length;

                return (
                  <div key={mod.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Module {mIndex + 1}: {mod.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {modCompleted}/{modLessons.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {modLessons.map((lesson) => {
                        const isSelected = currentLesson?.id === lesson.id;
                        const isCompleted = progressMap[lesson.id] === "COMPLETED";
                        const isInProgress = progressMap[lesson.id] === "IN_PROGRESS";

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => void loadAuthorizedLesson(mod.id, lesson)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-sm ${
                              isSelected
                                ? "bg-[#196A54]/30 text-white font-medium border border-[#196A54]/50"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <span className="shrink-0">
                              {isCompleted ? (
                                <CheckCircleIcon className="w-4 h-4 text-[#C2F25B]" />
                              ) : isInProgress ? (
                                <PlayIcon className="w-3.5 h-3.5 text-teal-400" />
                              ) : (
                                <CircleIcon className="w-4 h-4 text-slate-600" />
                              )}
                            </span>
                            <span className="truncate flex-1 text-left">{lesson.title}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {lesson.contentType === "VIDEO" ? (
                                <Video className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                            </span>
                            {lesson.durationSeconds && lesson.contentType === "VIDEO" ? (
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {Math.round(lesson.durationSeconds / 60)}m
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </aside>
      </div>
    </div>
  );
}
