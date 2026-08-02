// src/app/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  thumbnailUrl?: string;
  instructor?: {
    name: string;
  };
  category?: {
    name: string;
  };
  lessons?: Lesson[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse(courseRes.data.course || courseRes.data);

        // Safely verify if logged-in student already owns this course
        if (isAuthenticated && user?.role === "STUDENT") {
          try {
            const enrollmentsRes = await api.get("/enrolments");
            const rawData = enrollmentsRes.data;

            // Extract the actual array whether it's at data, data.enrolments, data.data, or data.items
            const enrolledList = Array.isArray(rawData)
              ? rawData
              : Array.isArray(rawData?.enrolments)
              ? rawData.enrolments
              : Array.isArray(rawData?.data)
              ? rawData.data
              : Array.isArray(rawData?.items)
              ? rawData.items
              : [];

            const ownsCourse = enrolledList.some(
              (item: any) => (item.course?.id || item.courseId) === courseId
            );
            setIsEnrolled(ownsCourse);
          } catch (err) {
            console.warn("Could not verify enrollment status", err);
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setErrorMessage("Course not found or no longer available.");
        } else {
          setErrorMessage("Failed to load course details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isAuthenticated, user]);

  const handleEnrollFree = async () => {
    try {
      await api.post("/enrolments/free", { courseId });
      setIsEnrolled(true);
      setToastMessage("Successfully enrolled! Taking you to the course...");
      setTimeout(() => router.push("/student"), 1500);
    } catch (error: any) {
      setToastMessage(
        error?.response?.data?.message || "Failed to enroll in free course."
      );
    }
  };

  const handleAddToCart = async (redirectImmediately = false) => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }

    try {
      await api.post("/cart/items", { courseId });
      if (redirectImmediately) {
        router.push("/cart");
      } else {
        setToastMessage("Added to cart! You can keep browsing.");
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        if (redirectImmediately) {
          router.push("/cart");
        } else {
          setToastMessage("This course is already in your cart!");
        }
      } else {
        setToastMessage(
          error?.response?.data?.message || "Could not add course to cart."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 mx-auto mb-4" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (errorMessage || !course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p className="font-semibold">{errorMessage || "Course not found"}</p>
          <button
            onClick={() => router.push("/courses")}
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Derive duration only from available lesson records
  const totalDurationMinutes =
    course.lessons?.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) || 0;
  const durationHours = Math.round((totalDurationMinutes / 60) * 10) / 10;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {toastMessage && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-900 px-4 py-3 text-sm text-white shadow-md">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="font-bold hover:underline"
            >
              Close
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Category & Level Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                {course.category?.name || "Engineering"}
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {course.level || "All Levels"}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Instructor:{" "}
              <span className="font-semibold text-slate-900">
                {course.instructor?.name || "Faculty Instructor"}
              </span>
            </p>

            {/* Thumbnail */}
            <div className="relative mt-6 h-72 w-full overflow-hidden rounded-xl bg-slate-200 shadow-sm">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No preview available
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900">
                About this Course
              </h2>
              <p className="mt-3 whitespace-pre-line text-slate-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Curriculum Section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Course Curriculum{" "}
                {durationHours > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    ({course.lessons?.length || 0} lessons • ~{durationHours}h total)
                  </span>
                )}
              </h2>

              {course.lessons && course.lessons.length > 0 ? (
                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {course.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {idx + 1}. {lesson.title}
                      </span>
                      <span className="text-slate-500">
                        {lesson.durationMinutes
                          ? `${lesson.durationMinutes} mins`
                          : "Self-paced"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  Curriculum lessons will be published soon.
                </div>
              )}
            </div>
          </div>

          {/* Action Card (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Investment
                </span>
                <p className="mt-1 text-4xl font-extrabold text-slate-900">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </p>
              </div>

              {/* Dynamic Action Area based on Authentication and Enrollment */}
              {isEnrolled ? (
                <button
                  onClick={() => router.push("/student")}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
                >
                  Continue Learning
                </button>
              ) : course.price === 0 ? (
                <button
                  onClick={handleEnrollFree}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Enroll Now — Free
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleAddToCart(false)}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              <ul className="mt-6 space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  ✓ Lifetime access to published lessons
                </li>
                <li className="flex items-center gap-2">
                  ✓ Verified certificate upon completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}