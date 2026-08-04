"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  thumbnailUrl: string | null;
  averageRating?: number;
  reviewCount?: number;
  learningObjectives?: string[];
  category?: { name: string };
  instructor?: { fullName: string };
  modules?: { id: string; title: string; _count?: { lessons: number } }[];
}

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { isAuthenticated, user } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      setIsLoading(true);
      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        const courseData = courseRes.data.course || courseRes.data;
        setCourse(courseData);

        if (isAuthenticated && user?.role === "STUDENT") {
          try {
            const enrollmentsRes = await api.get("/enrolments");
            const rawData = enrollmentsRes.data;
            const enrolledList = Array.isArray(rawData)
              ? rawData
              : Array.isArray(rawData?.enrollments)
              ? rawData.enrollments
              : Array.isArray(rawData?.data)
              ? rawData.data
              : Array.isArray(rawData?.items)
              ? rawData.items
              : [];

            const currentlyEnrolled = enrolledList.some(
              (item: any) => (item.course?.id || item.courseId) === courseId
            );
            setIsEnrolled(currentlyEnrolled);
          } catch (e) {
            console.warn("Could not verify enrollment status", e);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Failed to load course details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndStatus();
    }
  }, [courseId, isAuthenticated, user]);

  const handleEnrollFree = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }
    setIsActionLoading(true);
    try {
      await api.post("/enrolments/free", { courseId });
      setToastMessage("Successfully enrolled! You can now access the course.");
      setIsEnrolled(true);
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || "Could not enroll in course.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }
    setIsActionLoading(true);
    try {
      await api.post("/cart/items", { courseId });
      setToastMessage("Course added to your cart!");
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || "Could not add to cart.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // "Buy Now" — skips the cart entirely, goes straight to checkout.
  // Real backend call, redirects to the Paystack authorization_url.
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await api.post("/payments/checkout", { courseId });
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || "Could not start checkout.");
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 animate-pulse">
        <div className="h-80 w-full bg-slate-900/10" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <div className="h-96 w-full rounded-2xl bg-slate-200 shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">{error || "Not Found"}</h2>
        <p className="mb-6 text-slate-500">The course you are looking for does not exist or has been removed.</p>
        <Link
          href="/courses"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFree = course.priceCents === 0;
  const formattedPrice = isFree ? "Free" : `₵${(course.priceCents / 100).toFixed(2)}`;
  const hasLearningObjectives = course.learningObjectives && course.learningObjectives.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 transform px-4 w-full max-w-md">
          <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-4 font-bold text-blue-400 hover:underline">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-300">
                <Link href="/courses" className="hover:text-white transition">Courses</Link>
                <span>›</span>
                <span>{course.category?.name || "Uncategorized"}</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">★</span>
                  <span className="font-bold text-white">
                    {course.averageRating ? course.averageRating.toFixed(1) : "New"}
                  </span>
                  {course.reviewCount !== undefined && course.reviewCount > 0 && (
                    <span>({course.reviewCount.toLocaleString()} reviews)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>👨‍🏫</span>
                  <span>{course.instructor?.fullName || "Instructor"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
          <div className="lg:col-span-2 space-y-12">
            {/* Real learning objectives from the course, or omitted if none exist */}
            {hasLearningObjectives && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">What you&apos;ll learn</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-slate-700">
                  {course.learningObjectives!.map((objective, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{objective}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
              {course.modules && course.modules.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {course.modules.map((module, idx) => (
                    <div
                      key={module.id}
                      className={`p-5 flex items-center justify-between ${idx !== course.modules!.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h4 className="font-bold text-slate-800">{module.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {module._count?.lessons || 0} Lessons
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  The syllabus is currently being updated by the instructor.
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden -mt-32 lg:-mt-64 z-10">
              <div className="relative h-56 w-full bg-slate-100">
                <Image src={course.thumbnailUrl || FALLBACK_IMAGE} alt={course.title} fill className="object-cover" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">{formattedPrice}</span>
                </div>

                <div className="space-y-3">
                  {isEnrolled ? (
                    <Link
                      href="/student"
                      className="block w-full rounded-xl bg-slate-900 px-4 py-4 text-center font-bold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Go to Dashboard
                    </Link>
                  ) : isFree ? (
                    <button
                      onClick={handleEnrollFree}
                      disabled={isActionLoading}
                      className="w-full rounded-xl bg-blue-600 px-4 py-4 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
                    >
                      {isActionLoading ? "Enrolling..." : "Enroll Now"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleBuyNow}
                        disabled={isActionLoading}
                        className="w-full rounded-xl bg-blue-600 px-4 py-4 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
                      >
                        {isActionLoading ? "Redirecting..." : "Buy Now"}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={isActionLoading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-70"
                      >
                        {isActionLoading ? "Adding..." : "Add to Cart"}
                      </button>
                    </>
                  )}
                </div>

                {/* Only real, backed features listed */}
                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                  <h4 className="font-bold text-slate-900 text-sm">This course includes:</h4>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-3">
                      <span>📹</span> On-demand video access
                    </li>
                    <li className="flex items-center gap-3">
                      <span>♾️</span> Full lifetime access
                    </li>
                    <li className="flex items-center gap-3">
                      <span>🏆</span> Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}