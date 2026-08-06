"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

interface EnrolledCourse {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    instructor?: { fullName: string };
  };
}

// Mock Notifications Data (In the future, fetch this from the backend)
const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Welcome to MechSpec!", message: "Your engineering journey begins here.", time: "1h ago", unread: true },
  { id: 2, title: "System Update", message: "New advanced backend architecture modules have been added.", time: "5h ago", unread: true },
  { id: 3, title: "Payment Successful", message: "Your recent enrollment was processed successfully.", time: "1d ago", unread: false },
];

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/enrolments");
        const rawData = res.data;
        const enrolledList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.enrolments)
          ? rawData.enrolments
          : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.items)
          ? rawData.items
          : [];

        const sortedList = [...enrolledList].sort((a, b) => (b.progress || 0) - (a.progress || 0));
        setEnrollments(sortedList);
      } catch (err: any) {
        setError("Failed to load training data. Please check your connection and refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const firstName = user?.fullName?.split(" ")[0] || "Engineer";
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const avgProgress = totalCourses > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalCourses) 
    : 0;

  const priorityCourse = enrollments.length > 0 ? enrollments[0] : null;
  const otherCourses = enrollments.length > 1 ? enrollments.slice(1) : [];

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        
        {/* Enterprise Command Center Header */}
        <header className="bg-slate-900 pt-6 pb-16 relative overflow-visible z-30">
          
          {/* TOP UTILITY BAR (Notifications & Profile) */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 flex justify-end">
            <div className="flex items-center gap-6" ref={dropdownRef}>
              
              {/* Home / Catalog Link */}
              <Link href="/courses" className="text-sm font-medium text-slate-300 hover:text-white transition">
                Browse Catalog
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Unread Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-800 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 origin-top-right animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {notifications.map((note) => (
                            <div key={note.id} className={`p-4 transition hover:bg-slate-50 ${note.unread ? 'bg-blue-50/50' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm ${note.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {note.title}
                                </h4>
                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                  {note.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{note.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-sm text-slate-500">
                          You&apos;re all caught up!
                        </div>
                      )}
                    </div>
                    <Link href="#" className="block border-t border-slate-100 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-b-xl">
                      View all activity
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile / Logout */}
              <button 
                onClick={logout}
                className="text-sm font-semibold text-red-400 hover:text-red-300 transition"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
                  Training Overview
                </h1>
                <p className="mt-2 text-sm font-medium text-blue-300">
                  Welcome back, {firstName}. Here is your current training status.
                </p>
              </div>

              {/* Technical Metric Cards */}
              <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 min-w-[140px] backdrop-blur-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Enrolled</p>
                  <p className="text-2xl font-bold text-white font-mono">{totalCourses}</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 min-w-[140px] backdrop-blur-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{completedCourses}</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 min-w-[140px] backdrop-blur-sm">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-blue-400 font-mono">{avgProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          
          {error && (
            <div className="mb-8 rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm flex items-center gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-sm font-medium text-slate-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-8">
              <div className="h-48 w-full bg-slate-200 rounded-xl animate-pulse shadow-sm border border-slate-200" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="h-64 w-full bg-slate-200 rounded-xl animate-pulse shadow-sm border border-slate-200" />
                ))}
              </div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="space-y-10">
              
              {/* Priority Action */}
              {priorityCourse && (
                <section>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Priority Training
                  </h2>
                  
                  <div className="flex flex-col md:flex-row overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="md:w-1/3 relative h-48 md:h-auto bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200">
                      <Image
                        src={priorityCourse.course.thumbnailUrl || FALLBACK_IMAGE}
                        alt={priorityCourse.course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="md:w-2/3 p-6 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-wide uppercase">
                          In Progress
                        </span>
                        <span className="text-sm font-mono text-slate-500 font-medium">
                          {priorityCourse.progress || 0}%
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {priorityCourse.course.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-6 font-medium flex items-center gap-2">
                        <span>Instructor:</span>
                        <span className="text-slate-800">{priorityCourse.course.instructor?.fullName || "MechSpec Staff"}</span>
                      </p>
                      
                      <div className="mt-auto">
                        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                          <div
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${priorityCourse.progress || 0}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Link
                            href={`/learn/${priorityCourse.course.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 shadow-sm"
                          >
                            {priorityCourse.progress === 0 ? "Initialize Course" : "Resume Module"}
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Active Portfolio Grid */}
              {otherCourses.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                    Training Portfolio
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {otherCourses.map((enrolment) => {
                      const course = enrolment.course;
                      const progress = enrolment.progress || 0; 
                      const isComplete = progress === 100;

                      return (
                        <div key={enrolment.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-blue-400/50 relative">
                          {isComplete && (
                            <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                              COMPLETED
                            </div>
                          )}
                          <div className="relative h-40 w-full bg-slate-100 border-b border-slate-100">
                            <Image src={course.thumbnailUrl || FALLBACK_IMAGE} alt={course.title} fill className="object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[3rem] leading-snug">
                              {course.title}
                            </h3>
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              {course.instructor?.fullName || "MechSpec Staff"}
                            </p>
                            <div className="mt-auto pt-6">
                              <div className="mb-2 flex items-center justify-between text-xs font-mono font-medium">
                                <span className={isComplete ? "text-emerald-600" : "text-slate-600"}>
                                  {progress === 0 ? "NOT STARTED" : isComplete ? "CERTIFIED" : "IN PROGRESS"}
                                </span>
                                <span className="text-slate-900">{progress}%</span>
                              </div>
                              <div className="mb-5 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100">
                                <div className={`h-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                              </div>
                              <Link
                                href={`/learn/${course.id}`}
                                className={`block w-full rounded-md border py-2 text-center text-sm font-semibold transition-colors ${
                                  isComplete ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                }`}
                              >
                                {isComplete ? "Review Material" : progress === 0 ? "Start Module" : "Continue"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center sm:p-16 shadow-sm mt-8">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-slate-900 tracking-tight">No Active Enrollments</h3>
              <p className="mb-8 max-w-md text-sm text-slate-500 font-medium leading-relaxed">
                Your training portfolio is currently empty. Browse the engineering catalog to begin a certification track.
              </p>
              <Link href="/courses" className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
                Access Course Catalog
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}