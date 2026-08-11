"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Award, BookOpen } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface DashboardData {
  stats: {
    avgProgress: string;
    lessonsDone: number;
    certificates: number;
    timeInvested: string;
    activeCoursesCount: number;
  };
  activeCourses: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    progress: number;
    instructorName: string;
    timeRemaining: string;
    nextLesson: string;
  }>;
  recommendedCourses: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    instructorName: string;
    rating: number;
    reviewsCount: number;
    duration: string;
    price: number | null;
  }>;
  activities: Array<{
    id: string;
    title: string;
    iconType: string;
    createdAt: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useAuthStore(); 
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/student/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. HERO BANNER */}
      <section className="bg-[#196A54] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-[#12503F]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex-1">
            <p className="text-teal-100 font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              {user?.fullName || "Student"}
            </h1>
            <p className="text-emerald-400 font-semibold text-sm mb-8">You&apos;re on a 5-day learning streak!</p>
            
            {loading ? (
              <div className="flex flex-wrap gap-8">
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-8">
                <StatCard label="Avg Progress" value={data?.stats?.avgProgress || "0%"} variant="transparent" />
                <StatCard label="Lessons Done" value={data?.stats?.lessonsDone || 0} variant="transparent" />
                <StatCard label="Certificates" value={data?.stats?.certificates || 0} variant="transparent" />
                <StatCard label="Time Invested" value={data?.stats?.timeInvested || "0h"} variant="transparent" />
              </div>
            )}
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-full md:w-auto md:min-w-[160px]">
            <span className="text-4xl font-extrabold block mb-1">
              {loading ? "..." : data?.stats?.activeCoursesCount || 0}
            </span>
            <span className="text-teal-100 text-sm font-medium">Active Courses</span>
          </div>
        </div>
      </section>

      {/* 2. CONTINUE LEARNING GRID */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
          <Link href="/student/my-learning" className="text-sm font-semibold text-[#196A54] hover:underline">View all</Link>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-64 w-full" />
            <LoadingSkeleton className="h-64 w-full" />
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : !data?.activeCourses || data.activeCourses.length === 0 ? (
          <p className="text-slate-500 text-sm">You are not enrolled in any courses yet. Visit the catalog to start learning!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.activeCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                    <Image src={course.thumbnailUrl || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80"} alt={course.title} fill priority className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight mb-1 text-sm line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.timeRemaining} left remaining</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <ProgressBar value={course.progress} showPercent color="brand" />
                  <p className="text-xs text-slate-500 mt-3 mb-4">Next: {course.nextLesson}</p>
                  {/* Fixed: Replaced <button> with <Link> */}
                  <Link 
                    href={`/learn/${course.id}`}
                    className="block text-center w-full py-2.5 bg-[#0A4A3A] text-white rounded-lg text-sm font-bold hover:bg-[#12503F] transition-colors"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. BOTTOM GRID: Recommended & Activity */}
      {!loading && !error && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recommended Courses */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recommended Courses</h2>
              {/* Pointing to the catalog */}
              <Link href="/student/courses" className="text-sm font-semibold text-[#196A54] hover:underline">
                Browse all
              </Link>
            </div>
            
            {/* Fixed: Added Empty State Check */}
            {data?.recommendedCourses?.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[280px]">
                <p className="text-slate-600 text-sm font-medium mb-2">You are enrolled in all available courses!</p>
                <Link href="/student/courses" className="text-[#196A54] text-xs font-bold hover:underline">
                  Check the catalog for new releases
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {data?.recommendedCourses?.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-slate-100 shrink-0">
                      <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                      {course.price === null && (
                        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[#0A4A3A] text-xs font-bold px-2 py-1 rounded-md">
                          Free
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{course.instructorName}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="font-extrabold text-slate-900">
                        {course.price ? `$${course.price}` : "Free"}
                      </div>
                      {/* Fixed: Replaced <button> with <Link> */}
                      <Link 
                        href={`/student/courses/${course.id}`}
                        className="px-4 py-2 bg-[#0A4A3A] text-white rounded-lg text-xs font-bold hover:bg-[#12503F] transition-colors"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activity Feed */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Activity Feed</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-6">
                {data?.activities?.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No recent activity.</p>
                ) : (
                  data?.activities?.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        {activity.iconType === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                        {activity.iconType === 'badge' && <Award className="w-4 h-4" />}
                        {activity.iconType === 'enrolled' && <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}