// src/app/courses/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CourseCard, ApiCourse } from "@/components/courses/CourseCard";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Category {
  id: string;
  name: string;
}

function CourseCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") || "";
  const initialSearch = searchParams.get("search") || "";

  const { user, isAuthenticated } = useAuthStore();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.set("categoryId", selectedCategory);
        if (searchQuery) queryParams.set("search", searchQuery);

        const [coursesRes, categoriesRes] = await Promise.all([
          api.get(`/courses?${queryParams.toString()}`),
          api.get("/categories"),
        ]);

        setCourses(coursesRes.data.courses || coursesRes.data);
        setCategories(categoriesRes.data.categories || categoriesRes.data);

        // Safely check student enrollments
        if (isAuthenticated && user?.role === "STUDENT") {
          try {
            const enrollmentsRes = await api.get("/enrolments");
            const rawData = enrollmentsRes.data;

            // Safely parse array from backend wrapper
            const enrolledList = Array.isArray(rawData)
              ? rawData
              : Array.isArray(rawData?.enrolments)
              ? rawData.enrolments
              : Array.isArray(rawData?.data)
              ? rawData.data
              : Array.isArray(rawData?.items)
              ? rawData.items
              : [];

            const ids = new Set<string>(
              enrolledList.map((item: any) => item.course?.id || item.courseId)
            );
            setEnrolledCourseIds(ids);
          } catch (err) {
            console.warn("Could not load enrollments for catalog UI", err);
          }
        }
      } catch (error: any) {
        setErrorMessage("Could not load course catalog. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [selectedCategory, searchQuery, isAuthenticated, user]);

  const handleEnrollFree = async (courseId: string) => {
    try {
      await api.post("/enrolments/free", { courseId });
      setToastMessage("Enrolled successfully! Redirecting to course...");
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setToastMessage("You are already enrolled in this course!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(
          error?.response?.data?.message || "Failed to enroll in free course."
        );
      }
    }
  };

  const handleAddToCart = async (courseId: string) => {
    try {
      await api.post("/cart/items", { courseId });
      setToastMessage("Added to cart! Continue browsing or check out above.");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setToastMessage("This course is already in your cart or library!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(
          error?.response?.data?.message || "Could not add course to cart."
        );
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === ""
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((placeholder) => (
            <div
              key={placeholder}
              className="h-80 w-full animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : courses.length > 0 ? (
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
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <h3 className="text-lg font-bold text-slate-900">No courses found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try selecting a different category or clearing your search term.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CourseCatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading catalog...</div>}>
      <CourseCatalogContent />
    </Suspense>
  );
}