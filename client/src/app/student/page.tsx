"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

interface EnrolledCourse {
  id: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
  };
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    instructor?: { fullName: string };
  };
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/enrolments");
        const rawData = res.data;
        const enrolledList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.enrollments)
          ? rawData.enrollments
          : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.items)
          ? rawData.items
          : [];

        setEnrollments(enrolledList);
      } catch (err: any) {
        setError("Failed to load your courses. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "Student";

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="pb-20 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <header className="bg-white border-b border-slate-200 py-8 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pick up right where you left off and continue your engineering journey.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">My Learning</h2>
          </div>

          {error && (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
                  <div className="h-40 w-full bg-slate-200" />
                  <div className="flex flex-1 flex-col p-5 gap-4">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="mt-auto space-y-2 pt-4">
                      <div className="h-2 w-full rounded-full bg-slate-200" />
                      <div className="h-9 w-full rounded-lg bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enrollments.map((enrolment) => {
                const course = enrolment.course;
                const progress = enrolment.progress?.progressPercent ?? 0;

                return (
                  <div key={enrolment.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-blue-200">
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={course.thumbnailUrl || FALLBACK_IMAGE}
                        alt={course.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="rounded-full bg-white/90 p-3 shadow-lg">
                          <span className="text-blue-600 font-bold ml-1">▶</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[3rem]">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {course.instructor?.fullName || "Mech Spec Technologies"}
                      </p>

                      <div className="mt-auto pt-6">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600">{progress}% Complete</span>
                        </div>
                        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <Link
                          href={`/student/courses/${course.id}`}
                          className="block w-full rounded-lg bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                          {progress === 0 ? "Start Course" : "Resume Learning"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center sm:p-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">You haven&apos;t enrolled in any courses yet</h3>
              <p className="mb-8 max-w-md text-sm text-slate-500">
                Your dashboard is looking a little empty! Browse our catalog of expert-led engineering courses to start building your skills today.
              </p>
              <Link
                href="/courses"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Explore Course Catalog
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}