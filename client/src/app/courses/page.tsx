// src/app/courses/page.tsx
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CourseCard, ApiCourse } from "@/components/courses/CourseCard";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Category {
  id: string;
  name: string;
  _count?: {
    courses: number;
  };
}

// ----------------------------------------------------------------------------
// Skeleton Components for UI Feedback
// ----------------------------------------------------------------------------
const CourseSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
    <div className="h-48 w-full bg-slate-200" />
    <div className="flex flex-1 flex-col p-5 gap-4">
      <div className="h-6 w-3/4 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="h-6 w-16 rounded bg-slate-200" />
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  </div>
);

const CategorySkeleton = () => (
  <div className="space-y-3 py-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-8 w-full rounded-md bg-slate-200 animate-pulse" />
    ))}
  </div>
);

// ----------------------------------------------------------------------------
// Main Page Content
// ----------------------------------------------------------------------------
function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("categoryId") || "";

  const { user, isAuthenticated } = useAuthStore();
  const gridTopRef = useRef<HTMLDivElement>(null);
  
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  
  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // Displays 4 rows of 3 columns
  
  // Loading & Feedback States
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Categories and User Enrollments once on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsCategoriesLoading(true);
      try {
        const categoriesRes = await api.get("/categories");
        const rawCategories = categoriesRes.data.categories || categoriesRes.data;
        setCategories(Array.isArray(rawCategories) ? rawCategories : []);

        if (isAuthenticated && user?.role === "STUDENT") {
          const enrollmentsRes = await api.get("/enrollments");
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

          const ids = new Set<string>(
            enrolledList.map((item: any) => item.course?.id || item.courseId)
          );
          setEnrolledCourseIds(ids);
        }
      } catch (error) {
        console.error("Failed to fetch initial catalog data", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchInitialData();
  }, [isAuthenticated, user]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  // Fetch Courses whenever filters OR page changes
  useEffect(() => {
    const fetchCourses = async () => {
      setIsCoursesLoading(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (searchQuery) params.append("search", searchQuery);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const coursesRes = await api.get(`/courses?${params.toString()}`);
        
        // Handle variations in backend response structures
        const rawCourses = coursesRes.data.courses || coursesRes.data.data || coursesRes.data;
        setCourses(Array.isArray(rawCourses) ? rawCourses : []);

        // Flexible total pages calculation
        if (coursesRes.data.totalPages) {
          setTotalPages(coursesRes.data.totalPages);
        } else if (coursesRes.data.total) {
          setTotalPages(Math.ceil(coursesRes.data.total / limit));
        } else {
          setTotalPages(1); // Fallback if backend hasn't implemented counts yet
        }
        
      } catch (error: any) {
        setErrorMessage("Failed to load courses. Please try again later.");
      } finally {
        setIsCoursesLoading(false);
      }
    };

    // Debounce to prevent spamming the API while typing
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Smooth scroll back to top of the grid when changing pages
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEnrollFree = async (courseId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }
    try {
      await api.post("/enrolments/free", { courseId });
      setToastMessage("Successfully enrolled! You can now start learning.");
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setToastMessage("You are already enrolled in this course!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(error?.response?.data?.message || "Could not complete enrollment.");
      }
    }
  };

  const handleAddToCart = async (courseId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }
    try {
      await api.post("/cart/items", { courseId });
      setToastMessage("Course added to your cart!");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setToastMessage("You already own or have this course in your cart!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(error?.response?.data?.message || "Could not add course to cart.");
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPage(1);
    router.replace("/courses");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-16 z-40 mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-4 font-bold text-blue-400 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Catalog Header */}
      {/* Compute header title outside of JSX to avoid nested ternary */}
      {(() => {
        let headerTitle = "All Courses";
        if (searchQuery) {
          headerTitle = `Search Results for "${searchQuery}"`;
        } else if (selectedCategory) {
          headerTitle = "Category Results";
        }

        return (
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-12 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{headerTitle}</h1>
              <p className="mt-2 text-blue-100">
                Expand your engineering expertise with our industry-leading curriculum.
              </p>
            </div>
          </div>
        );
      })()}
      

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" ref={gridTopRef}>
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Filters</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a course..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {isCategoriesLoading ? (
                    <CategorySkeleton />
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                          selectedCategory === ""
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cat.name}
                          {cat._count?.courses !== undefined && (
                            <span className="ml-2 text-xs text-slate-400">
                              ({cat._count.courses})
                            </span>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {(searchQuery || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="mt-6 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Course Grid */}
          <main className="flex-1">
            {errorMessage && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {isCoursesLoading ? (
              // Fill layout with exact limit to prevent UI jumping
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: limit }).map((_, idx) => (
                  <CourseSkeleton key={idx} />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isAuthenticated={isAuthenticated}
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onEnrollFree={handleEnrollFree}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-slate-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-500 max-w-sm mb-6">
                  We couldn't find any courses matching your current filters. Try adjusting your search or category selection.
                </p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CoursesCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}