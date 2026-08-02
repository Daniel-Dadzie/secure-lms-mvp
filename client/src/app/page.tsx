// src/app/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Deterministic pastel color mapping matching Chioma's category grid UI
const PASTEL_THEMES = [
  "bg-blue-50/70 border-blue-100 hover:border-blue-400 text-blue-950",
  "bg-emerald-50/70 border-emerald-100 hover:border-emerald-400 text-emerald-950",
  "bg-amber-50/70 border-amber-100 hover:border-amber-400 text-amber-950",
  "bg-purple-50/70 border-purple-100 hover:border-purple-400 text-purple-950",
  "bg-rose-50/70 border-rose-100 hover:border-rose-400 text-rose-950",
  "bg-cyan-50/70 border-cyan-100 hover:border-cyan-400 text-cyan-950",
  "bg-indigo-50/70 border-indigo-100 hover:border-indigo-400 text-indigo-950",
  "bg-teal-50/70 border-teal-100 hover:border-teal-400 text-teal-950",
];

// Static testimonials block matching Chioma's design exactly
const TESTIMONIALS = [
  {
    quote:
      "The Advanced Mechanical Systems course completely transformed my career. The curriculum is industry-relevant and the instructors are world-class.",
    author: "Alex Rivera",
    role: "Mechanical Engineer • Boeing",
    initials: "AR",
    color: "bg-blue-600",
  },
  {
    quote:
      "I went from zero CNC knowledge to landing a dream job in 6 months. The practical projects and real-world simulations made all the difference.",
    author: "Priya Patel",
    role: "CNC Programmer • Lockheed Martin",
    initials: "PP",
    color: "bg-blue-700",
  },
  {
    quote:
      "Mech Spec Technologies has the best robotics curriculum I've seen. The hands-on approach is truly unique.",
    author: "Marcus Johnson",
    role: "Robotics Lead • Tesla",
    initials: "MJ",
    color: "bg-indigo-600",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          api.get("/courses?limit=6"),
          api.get("/categories"),
        ]);

        const rawCourses = coursesRes.data.courses || coursesRes.data;
        const rawCategories =
          categoriesRes.data.categories || categoriesRes.data;

        setCourses(Array.isArray(rawCourses) ? rawCourses : []);
        setCategories(Array.isArray(rawCategories) ? rawCategories : []);

        // Proactive Enrollment Check: swap CTA to "Continue Learning"
        if (isAuthenticated && user?.role === "STUDENT") {
          try {
            const enrollmentsRes = await api.get("/enrolments");
            const rawData = enrollmentsRes.data;
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
          } catch (enrollError) {
            console.warn(
              "Could not fetch user enrollments for CTA swap",
              enrollError
            );
          }
        }
      } catch (error: any) {
        setErrorMessage(
          "Failed to load platform data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [isAuthenticated, user]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/courses");
    }
  };

  const handleEnrollFree = async (courseId: string) => {
    // Intent preservation for unauthenticated users
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }

    try {
      await api.post("/enrolments/free", { courseId });
      setToastMessage("Successfully enrolled! You can now start learning.");
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
    } catch (error: any) {
      // Graceful 409 handling
      if (error?.response?.status === 409) {
        setToastMessage("You are already enrolled in this course!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(
          error?.response?.data?.message ||
            "Could not complete free enrollment."
        );
      }
    }
  };

  const handleAddToCart = async (courseId: string) => {
    // Intent preservation for unauthenticated users
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses/${courseId}`);
      return;
    }

    try {
      await api.post("/cart/items", { courseId });
      setToastMessage("Course added to your cart!");
    } catch (error: any) {
      // Graceful 409 handling
      if (error?.response?.status === 409) {
        setToastMessage("You already own or have this course in your cart!");
        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
      } else {
        setToastMessage(
          error?.response?.data?.message || "Could not add course to cart."
        );
      }
    }
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

      {/* Hero Section - Removed Badge */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
            Master Engineering Skills That Drive Industry Forward
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:mt-6">
            Learn from industry experts with hands-on courses in mechanical
            engineering, CNC programming, robotics, and more.
          </p>

          {/* Search Input Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl bg-white p-2 shadow-xl"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses (e.g., CNC, SolidWorks, Robotics...)"
              className="w-full border-none px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Keyword Triggers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-blue-100">
            <span className="font-semibold text-white">Popular:</span>
            {[
              "CNC Programming",
              "SolidWorks",
              "Fluid Mechanics",
              "Robotics",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  router.push(`/courses?search=${encodeURIComponent(tag)}`)
                }
                className="hover:text-white hover:underline transition"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 border-t border-blue-500/40 pt-8 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-extrabold sm:text-3xl">50,000+</p>
              <p className="text-xs text-blue-100 sm:text-sm">Students</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold sm:text-3xl">200+</p>
              <p className="text-xs text-blue-100 sm:text-sm">Instructors</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold sm:text-3xl">500+</p>
              <p className="text-xs text-blue-100 sm:text-sm">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold sm:text-3xl">98%</p>
              <p className="text-xs text-blue-100 sm:text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Categories Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Browse by Category
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Find courses in your area of interest
              </p>
            </div>
            <Link
              href="/courses"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((placeholder) => (
                <div
                  key={placeholder}
                  className="h-28 w-full animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {categories.map((cat, idx) => {
                const themeClass =
                  PASTEL_THEMES[idx % PASTEL_THEMES.length];
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      router.push(`/courses?categoryId=${cat.id}`)
                    }
                    className={`flex flex-col items-start justify-between rounded-xl border p-5 text-left transition hover:shadow-md ${themeClass}`}
                  >
                    <div>
                      <span className="text-xl block mb-2">⚙️</span>
                      <span className="font-bold text-base block line-clamp-1">
                        {cat.name}
                      </span>
                    </div>
                    {cat._count?.courses !== undefined && (
                      <span className="mt-4 text-xs font-semibold opacity-75">
                        {cat._count.courses}{" "}
                        {cat._count.courses === 1 ? "course" : "courses"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No categories available yet.
            </p>
          )}
        </section>

        {/* Featured Courses Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Featured Courses
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Handpicked by our technical experts
              </p>
            </div>
            <Link
              href="/courses"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              Explore All
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((placeholder) => (
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
              <h3 className="text-lg font-bold text-slate-900">
                No featured courses found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Check back soon as instructors publish new content.
              </p>
            </div>
          )}
        </section>

        {/* Testimonials Section */}
        <section className="border-t border-slate-200 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              What Our Students Say
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real results from real engineers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex text-amber-400 text-sm mb-4">
                    ★★★★★
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${item.color}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.author}
                    </h4>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Conversion Banner */}
      <section className="bg-blue-600 py-16 text-white text-center mt-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Advance Your Engineering Career?
          </h2>
          <p className="mt-3 text-blue-100 text-base">
            Join 50,000+ engineers who have transformed their careers with Mech
            Spec Technologies.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Start Learning Today
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="rounded-lg border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}