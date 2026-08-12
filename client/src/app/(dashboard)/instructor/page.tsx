"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import {
  GraduationCap, 
  CheckCircle2, 
  Coins, 
  Plus, 
  BookOpen 
} from "lucide-react";

interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  completionCount: number;
  revenueCents: number;
  averageProgress: number;
}

interface OverviewData {
  courses: CourseAnalytics[];
  totals: {
    totalEnrollments: number;
    totalCompletions: number;
    totalRevenueCents: number;
  };
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get("/instructor/analytics/overview");
        setOverview(res.data);
      } catch (err: any) {
        setError("Failed to load analytics. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const displayName = user?.fullName || "Instructor";

  const filteredCourses = overview?.courses.filter((course) =>
    course.courseTitle.toLowerCase().includes(searchQuery)
  ) || [];

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s how your active technical courses are performing.
            </p>
          </div>
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Totals Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : overview?.totals ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Card 1: Total Enrollments */}
            <div className="flex flex-col items-center text-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900">
                  {overview.totals.totalEnrollments.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">Total Enrollments</p>
              </div>
            </div>

            {/* Card 2: Total Completions */}
            <div className="flex flex-col items-center text-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900">
                  {overview.totals.totalCompletions.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">Total Completions</p>
              </div>
            </div>

            {/* Card 3: Total Revenue */}
            <div className="flex flex-col items-center text-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Coins className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900">
                  ₵{(overview.totals.totalRevenueCents / 100).toFixed(2)}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">Total Revenue</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Per-Course Breakdown Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Courses</h2>
            {searchQuery && (
              <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                Filtering by: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Course</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Enrollments</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Completions</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Avg Progress</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCourses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        {course.courseTitle}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 font-medium">
                        {course.enrollmentCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 font-medium">
                        {course.completionCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {course.averageProgress}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ₵{(course.revenueCents / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No matching courses found</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                No active courses match your search criteria. Try clearing your search term.
              </p>
              
              <button
                onClick={() => router.push("/instructor")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}