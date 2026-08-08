"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Image from "next/image";

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
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("http://localhost:4000/api/student/dashboard", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
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
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Daniel Yaw Dadzie</h1>
            <p className="text-emerald-400 font-semibold text-sm mb-8">You&apos;re on a 5-day learning streak!</p>
            
            {loading ? (
              <div className="flex gap-6">
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
                <LoadingSkeleton className="h-16 w-24 bg-white/20" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-8">
                <StatCard label="Avg Progress" value={data?.stats.avgProgress || "0%"} variant="transparent" />
                <StatCard label="Lessons Done" value={data?.stats.lessonsDone || 0} variant="transparent" />
                <StatCard label="Certificates" value={data?.stats.certificates || 0} variant="transparent" />
                <StatCard label="Time Invested" value={data?.stats.timeInvested || "0h"} variant="transparent" />
              </div>
            )}
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-full md:w-auto md:min-w-[160px]">
            <span className="text-4xl font-extrabold block mb-1">
              {loading ? "..." : data?.stats.activeCoursesCount || 0}
            </span>
            <span className="text-teal-100 text-sm font-medium">Active Courses</span>
          </div>
        </div>
      </section>

      {/* 2. CONTINUE LEARNING GRID */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
          <button className="text-sm font-semibold text-[#196A54] hover:underline">View all</button>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-64 w-full" />
            <LoadingSkeleton className="h-64 w-full" />
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        ) : data?.activeCourses.length === 0 ? (
          <p className="text-slate-500 text-sm">You are not enrolled in any courses yet. Visit the catalog to start learning!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.activeCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                    <Image src={course.thumbnailUrl || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80"} alt={course.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight mb-1 text-sm line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.timeRemaining} left remaining</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <ProgressBar value={course.progress} showPercent color="brand" />
                  <p className="text-xs text-slate-500 mt-3 mb-4">Next: {course.nextLesson}</p>
                  <button className="w-full py-2.5 bg-[#0A4A3A] text-white rounded-lg text-sm font-bold hover:bg-[#12503F] transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}