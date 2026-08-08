"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowLeft 
} from "lucide-react";
import api from "@/lib/api"; // Your configured axios or fetch client

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Fetch course details provided by the instructor from the backend API
  useEffect(() => {
    async function fetchCourseDetails() {
      if (!courseId) return;
      try {
        setIsLoading(true);
        // Calls your backend endpoint: GET /api/courses/{id}
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.message || "Failed to load course details. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      // Calls your backend enrollment endpoint: POST /api/courses/{id}/enroll
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to enroll in course.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-sm font-medium">Loading course syllabus...</div>
      </div>
    );
  }

  if (errorMessage || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-sm text-slate-500">{errorMessage || "The course you are looking for does not exist or has been removed."}</p>
        <Link href="/courses" className="bg-[#0A4A3A] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#0A4A3A] text-white pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          <div className="space-y-4 max-w-3xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#135249] border border-emerald-600/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-emerald-100">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{course.rating || "5.0"}</span>
                <span>({course.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>{course.studentsCount || 0} students enrolled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Syllabus & Modules */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900">About This Course</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {course.longDescription || course.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Course Curriculum</h3>
              <div className="space-y-3">
                {course.modules?.map((mod: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{mod.title}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{mod.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Card */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl space-y-6 sticky top-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrollment</p>
                  <p className="text-3xl font-extrabold text-[#0A4A3A] mt-1">{course.price ? `$${course.price}` : "Free Access"}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold border border-emerald-100">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {isEnrolled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-slate-900 text-sm">Successfully Enrolled!</p>
                  <Link
                    href="/student"
                    className="inline-flex w-full items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm mt-2"
                  >
                    Go to Student Dashboard
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm"
                >
                  Enroll in Course Now
                </button>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A4A3A] text-white flex items-center justify-center font-bold text-xs">
                  {course.instructorName ? course.instructorName.charAt(0) : "I"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{course.instructorName || "Assigned Instructor"}</p>
                  <p className="text-[10px] text-slate-500">Expert Engineering Faculty</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}