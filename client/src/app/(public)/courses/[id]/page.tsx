"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ArrowLeft,
  Lock,
  PlayCircle,
} from "lucide-react";
import api from "@/lib/api";
import { CourseReviewsSection } from "@/components/courses/CourseReviewsSection";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/currency";
import type { PublicCourseDetail } from "@/types/course";

function formatDuration(seconds?: number | null) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { isAuthenticated, user } = useAuthStore();

  const [course, setCourse] = useState<PublicCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    async function fetchCourseDetails() {
      try {
        setIsLoading(true);
        const response = await api.get(`/courses/${courseId}`);
        if (!cancelled) {
          setCourse(response.data.course);
          setErrorMessage(null);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || "Failed to load course details. Please try again later.";
          setErrorMessage(message);
          setCourse(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchCourseDetails();
    return () => { cancelled = true; };
  }, [courseId]);

  const handleEnrollFree = async () => {
    if (!course) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/enrollments/free", { courseId: course.id });
      const response = await api.get(`/courses/${course.id}`);
      setCourse(response.data.course);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to enroll.";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!course) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }
    setActionLoading(true);
    try {
      await api.post("/cart/items", { courseId: course.id });
      router.push("/cart");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
      if (message.includes("enrolled")) {
        router.push(`/learn/${course.id}`);
      } else if (message.includes("cart")) {
        router.push("/cart");
      } else {
        alert(message || "Could not add to cart.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-sm font-medium">Loading course...</div>
      </div>
    );
  }

  if (errorMessage || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          {errorMessage || "The course you are looking for does not exist or is not available."}
        </p>
        <Link href="/courses" className="bg-[#0A4A3A] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm">
          Back to Courses
        </Link>
      </div>
    );
  }

  const totalLessons =
    course.modules?.reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0) ?? 0;
  const canPlay = course.access.canPlayContent;
  const isPreview = course.access.isPreview;

  const startCourseHref = `/learn/${course.id}`;
  const heroImage = course.thumbnailUrl || "/images/course-fallback.jpg";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <section className="relative text-white pt-16 pb-24 md:pb-28 overflow-hidden min-h-[420px] md:min-h-[480px] flex items-end">
        {/* Thumbnail background */}
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          className="object-cover object-center scale-105"
          unoptimized
          aria-hidden
        />
        {/* Legibility overlays */}
        <div className="absolute inset-0 bg-[#0A4A3A]/80" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#062f26] via-[#0A4A3A]/75 to-[#0A4A3A]/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#062f26]/95 via-[#0A4A3A]/70 to-transparent md:from-[#062f26]/90 md:via-[#0A4A3A]/60"
          aria-hidden
        />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-6 pb-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white transition-colors drop-shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          <div className="max-w-3xl space-y-4">
            {isPreview && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-100 text-xs font-bold uppercase backdrop-blur-sm">
                {course.status === "DRAFT" ? "Draft Preview" : "Preview Mode"}
              </span>
            )}
            {course.category && (
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                {course.category.name}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-50/95 leading-relaxed max-w-2xl drop-shadow-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-emerald-100">
              <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">
                  {(course.averageRating ?? 0) > 0 ? (course.averageRating ?? 0).toFixed(1) : "New"}
                </span>
                {(course.reviewCount ?? 0) > 0 && (
                  <span>({course.reviewCount} reviews)</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
                <Users className="w-4 h-4 text-emerald-200" />
                <span>{course.enrollmentCount ?? 0} students enrolled</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-emerald-200" />
                  <span>{course.duration}</span>
                </div>
              )}
              {totalLessons > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
                  <BookOpen className="w-4 h-4 text-emerald-200" />
                  <span>{totalLessons} lessons</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {(course.longDescription || course.description) && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900">About This Course</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {course.longDescription || course.description}
                </p>
              </div>
            )}

            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900">What You&apos;ll Learn</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {course.learningObjectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">Course Curriculum</h3>
                {!canPlay && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                    Enroll to play lessons
                  </span>
                )}
              </div>

              {!course.modules || course.modules.length === 0 ? (
                <p className="text-sm text-slate-500">Curriculum coming soon.</p>
              ) : (
                <div className="space-y-4">
                  {course.modules.map((mod, i) => (
                    <div key={mod.id} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">
                          Module {i + 1}: {mod.title}
                        </p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 text-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {canPlay ? (
                                <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="font-medium text-slate-800 truncate">
                                {lesson.title}
                              </span>
                            </div>
                            {formatDuration(lesson.durationSeconds) && (
                              <span className="text-xs text-slate-500 shrink-0 ml-2">
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CourseReviewsSection
              courseId={course.id}
              canSubmitReview={course.access.isEnrolled && user?.role === "STUDENT"}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl space-y-6 sticky top-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrollment</p>
                  <p className="text-3xl font-extrabold text-[#0A4A3A] mt-1">
                    {formatPrice(course.priceCents)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold border border-emerald-100">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {canPlay ? (
                <div className="space-y-3">
                  {course.access.isEnrolled && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <p className="font-bold text-slate-900 text-sm">You&apos;re enrolled</p>
                    </div>
                  )}
                  {course.access.isOwner && (
                    <p className="text-xs text-center text-slate-500">You are the course instructor.</p>
                  )}
                  {course.access.isAdmin && !course.access.isOwner && (
                    <p className="text-xs text-center text-slate-500">Admin preview access.</p>
                  )}
                  <Link
                    href={startCourseHref}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {course.access.isEnrolled ? "Continue Course" : "Start Course"}
                  </Link>
                </div>
              ) : isPreview ? (
                <p className="text-sm text-slate-600 text-center">
                  This is a preview of your {course.status.toLowerCase()} course. Publish it to make it public.
                </p>
              ) : !isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 text-center">
                    Sign in or create an account to enroll and access course content.
                  </p>
                  <Link
                    href={`/login?redirect=/courses/${course.id}`}
                    className="inline-flex w-full items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm"
                  >
                    Sign in to Enroll
                  </Link>
                  <Link
                    href={`/register?returnTo=/courses/${course.id}`}
                    className="inline-flex w-full items-center justify-center border border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl text-sm hover:bg-slate-50"
                  >
                    Create Account
                  </Link>
                </div>
              ) : course.priceCents === 0 ? (
                <button
                  onClick={handleEnrollFree}
                  disabled={actionLoading}
                  className="w-full bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm disabled:opacity-70"
                >
                  {actionLoading ? "Enrolling..." : "Enroll for Free"}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={actionLoading}
                  className="w-full bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm disabled:opacity-70"
                >
                  {actionLoading ? "Adding..." : "Add to Cart"}
                </button>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A4A3A] text-white flex items-center justify-center font-bold text-xs">
                  {course.instructor.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{course.instructor.fullName}</p>
                  <p className="text-[10px] text-slate-500">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
