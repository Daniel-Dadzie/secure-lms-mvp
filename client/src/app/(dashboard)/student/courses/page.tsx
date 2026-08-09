"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Clock, BarChart, Star } from "lucide-react";

import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { EmptyState } from "@/components/ui/EmptyState";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant";
import { CourseCardSkeleton } from "@/components/ui/LoadingSkeleton";


const FALLBACK_IMAGE = "/images/course-fallback.jpg";

// --- Interfaces matching your backend ---
interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  priceCents: number;
  averageRating?: number;
  reviewCount?: number;
  duration?: string;
  level?: string;
  instructor?: { fullName: string };
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { courses: number };
}

export default function StudentCourseCatalogPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // --- Data State ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  
  // --- Filter State ---
  const [activeCategoryId, setActiveCategoryId] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [sortFilter, setSortFilter] = useState("Most Popular");

  // --- UI State ---
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- API Integrations ---

  // 1. Fetch Categories on mount
  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const raw = res.data;
        setCategories(Array.isArray(raw) ? raw : Array.isArray(raw?.categories) ? raw.categories : []);
      })
      .catch(() => console.error("Failed to load categories"));
  }, []);

  // 2. Fetch Enrolments to manage CTA buttons
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "STUDENT") return;
    api.get("/enrolments")
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.enrollments) ? raw.enrollments : [];
        setEnrolledCourseIds(new Set(list.map((e: any) => e.course?.id || e.courseId)));
      })
      .catch(() => {});
  }, [isAuthenticated, user]);

  // 3. Fetch Courses (Triggered by filter changes)
  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const params: Record<string, string> = {};
      
      if (searchQuery) params.search = searchQuery;
      if (activeCategoryId !== "All") params.categoryId = activeCategoryId;
      if (levelFilter !== "All Levels") params.level = levelFilter;
      
      // Mapping sort options for the backend
      if (sortFilter === "Price: Low to High") { params.sortBy = "price"; params.sortOrder = "asc"; }
      if (sortFilter === "Highest Rated") { params.sortBy = "rating"; params.sortOrder = "desc"; }
      if (sortFilter === "Most Popular") { params.sortBy = "popularity"; params.sortOrder = "desc"; }

      const res = await api.get("/courses", { params });
      const raw = res.data;
      const list: Course[] = Array.isArray(raw) ? raw : raw?.data || raw?.courses || [];
      
      setCourses(list);
    } catch {
      showToast("Failed to load courses. Please refresh.", "error");
    } finally {
      setIsLoadingCourses(false);
    }
  }, [searchQuery, activeCategoryId, levelFilter, sortFilter]);

  // Debounce search query so it doesn't spam the API on every keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchCourses]);

  // --- Actions ---

  const handleEnrollFree = async (courseId: string) => {
    if (!isAuthenticated) return router.push(`/login?returnTo=/student/courses`);
    setEnrolling(courseId);
    try {
      await api.post("/enrolments/free", { courseId });
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      showToast("Successfully enrolled! You can start learning now.");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Could not enroll. Please try again.", "error");
    } finally {
      setEnrolling(null);
    }
  };

  const handleAddToCart = async (courseId: string) => {
    if (!isAuthenticated) return router.push(`/login?returnTo=/student/courses`);
    setAddingToCart(courseId);
    try {
      await api.post("/cart/items", { courseId });
      showToast("Course added to cart!");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Could not add to cart.", "error");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fafa] text-slate-800 font-sans pb-12 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-full max-w-sm px-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.type === "success" ? "bg-[#115e59]" : "bg-red-600"}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-white/70 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        
        {/* Page Title & Breadcrumb (Optional, if not handled by DashboardShell) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and enroll in new courses</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, instructors..."
              className="w-full bg-white border border-teal-100 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
            />
          </div>
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-white border border-teal-100 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm cursor-pointer md:w-40"
          >
            <option value="All Levels">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select 
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="bg-white border border-teal-100 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm cursor-pointer md:w-48"
          >
            <option value="Most Popular">Most Popular</option>
            <option value="Highest Rated">Highest Rated</option>
            <option value="Price: Low to High">Price: Low to High</option>
          </select>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          <button
            onClick={() => setActiveCategoryId("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
              activeCategoryId === "All"
                ? "bg-[#115e59] text-white"
                : "bg-white text-slate-600 hover:bg-teal-50 border border-teal-100"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                activeCategoryId === cat.id
                  ? "bg-[#115e59] text-white"
                  : "bg-white text-slate-600 hover:bg-teal-50 border border-teal-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <p className="text-slate-500 text-sm font-medium mb-6">
          {!isLoadingCourses && (
            <><span className="font-bold text-teal-800">{courses.length}</span> courses found</>
          )}
        </p>

        {/* Courses Grid */}
        {isLoadingCourses ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon="🔍"
              title="No courses match your filters"
              description="Try adjusting your search terms, level, or clearing the active filters."
              action={
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategoryId("All");
                    setLevelFilter("All Levels");
                    setSortFilter("Most Popular");
                  }}
                  className="rounded-lg bg-[#115e59] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-900"
                >
                  Clear Filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isFree = course.priceCents === 0;
              const isEnrolled = enrolledCourseIds.has(course.id);
              const isAddingThis = addingToCart === course.id;
              const isEnrollingThis = enrolling === course.id;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl overflow-hidden border border-teal-50 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                >
                  <Link href={`/student/courses/${course.id}`} className="block">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                      <Image 
                        src={course.thumbnailUrl || FALLBACK_IMAGE} 
                        alt={course.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {course.category && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold text-teal-800 shadow-sm">
                          {course.category.name}
                        </div>
                      )}
                      {isFree && (
                        <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm">
                          Free
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <Link href={`/student/courses/${course.id}`}>
                      <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 group-hover:text-teal-700 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>
                    
                    {course.instructor && (
                      <p className="text-slate-500 text-sm mb-3">{course.instructor.fullName}</p>
                    )}

                    {course.averageRating !== undefined && course.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-sm mb-3">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700">{course.averageRating.toFixed(1)}</span>
                        {course.reviewCount !== undefined && (
                          <span className="text-slate-400">({course.reviewCount.toLocaleString()})</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration || "Self-paced"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart className="w-3.5 h-3.5 text-blue-500" />
                        <span>{course.level || "All Levels"}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="font-extrabold text-lg text-[#115e59]">
                        {isFree ? "Free" : `$${(course.priceCents / 100).toFixed(2)}`}
                      </span>
                      
                      {isEnrolled ? (
                        <Link 
                          href={`/learn/${course.id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          Continue
                        </Link>
                      ) : isFree ? (
                        <button 
                          onClick={() => handleEnrollFree(course.id)}
                          disabled={isEnrollingThis}
                          className="bg-[#115e59] hover:bg-teal-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
                        >
                          {isEnrollingThis ? "Enrolling..." : "Enroll Free"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAddToCart(course.id)}
                          disabled={isAddingThis}
                          className="bg-[#115e59] hover:bg-teal-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
                        >
                          {isAddingThis ? "Adding..." : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FloatingFAQAssistant />
    </div>
  );
}