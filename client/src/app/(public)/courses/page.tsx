"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/currency";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  priceCents: number;
  averageRating: number;
  reviewCount: number;
  level: string;
  instructor: {
    id: string;
    fullName: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    courses: number;
  };
}

function levelBadge(level: string) {
  const map: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
    ALL_LEVELS: "bg-blue-100 text-blue-800",
  };

  const label: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    ALL_LEVELS: "All Levels",
  };

  return {
    cls: map[level] ?? "bg-slate-100 text-slate-700",
    label: label[level] ?? level,
  };
}

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state — initialized from URL params
  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") ?? ""
  );
  const [level, setLevel] = useState(
    searchParams.get("level") ?? ""
  );
  const [priceFilter, setPriceFilter] = useState(
    searchParams.get("price") ?? ""
  );
  const [cartAdding, setCartAdding] = useState<string | null>(null);

  /*
   * Fetch courses whenever the search/category filters change.
   *
   * The async function is defined inside the effect so that the
   * effect itself handles the external API synchronization.
   * This avoids the react-hooks/set-state-in-effect lint error
   * without changing the API request or state update behavior.
   */
  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (search) {
          params.set("search", search);
        }

        if (selectedCategory) {
          params.set("categoryId", selectedCategory);
        }

        const query = params.toString();
        const url = query
          ? `/courses?${query}&limit=12`
          : "/courses?limit=12";

        const res = await api.get(url);

        if (cancelled) return;

        setCourses(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
      } catch {
        if (cancelled) return;

        setCourses([]);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCourses();

    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory]);

  // Load categories once when the page mounts.
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");

        if (!cancelled) {
          setCategories(res.data.categories ?? []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddToCart(courseId: string) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setCartAdding(courseId);

    try {
      await api.post("/cart/items", { courseId });
      router.push("/cart");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";

      if (msg.includes("enrolled")) {
        router.push(`/learn/${courseId}`);
      } else if (msg.includes("cart")) {
        router.push("/cart");
      }
    } finally {
      setCartAdding(null);
    }
  }

  async function handleEnrollFree(courseId: string) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await api.post("/enrollments/free", { courseId });
      router.push("/student");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";

      if (msg.includes("enrolled")) {
        router.push("/student");
      }
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (level && course.level !== level) {
      return false;
    }

    if (priceFilter === "free" && course.priceCents !== 0) {
      return false;
    }

    if (priceFilter === "paid" && course.priceCents === 0) {
      return false;
    }

    return true;
  });

  return (
    <div>
      {/* Hero banner */}
      <section className="bg-[#0A4A3A] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#C2F25B]">
            Course Catalogue
          </p>

          <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
            Browse Engineering Courses
          </h1>

          <p className="max-w-2xl text-lg text-teal-50">
            {total > 0
              ? `${total}+ industry-relevant courses`
              : "Industry-relevant courses"}{" "}
            taught by world-class engineers. Learn at your own pace.
          </p>
        </div>
      </section>


      {/* Filters */}
      <section className="sticky top-20 z-40 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            
            {/* Search and Dropdowns Container */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <svg
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#196A54]/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full sm:w-64 rounded-full border border-[#196A54]/20 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-[#196A54]/50 focus:border-[#0A4A3A] focus:ring-2 focus:ring-[#0A4A3A]"
                />
              </div>

              {/* Dropdowns in a 2-column grid on mobile */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className="w-full cursor-pointer rounded-full border border-[#196A54]/20 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-[#0A4A3A] outline-none focus:ring-2 focus:ring-[#0A4A3A]"
                >
                  <option value="">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
                <select
                  value={priceFilter}
                  onChange={(event) => setPriceFilter(event.target.value)}
                  className="w-full cursor-pointer rounded-full border border-[#196A54]/20 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-[#0A4A3A] outline-none focus:ring-2 focus:ring-[#0A4A3A]"
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="whitespace-nowrap text-sm font-medium text-slate-500">
              {loading
                ? "Loading..."
                : `${filteredCourses.length} course${
                    filteredCourses.length !== 1 ? "s" : ""
                  } found`}
            </div>
          </div>

          {/* Category pills — Horizontally scrollable on mobile, wrapping on larger screens */}
          <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition-all shrink-0 ${
                !selectedCategory
                  ? "bg-[#0A4A3A] text-white"
                  : "border border-[#196A54]/30 bg-[#F4F9F7] text-[#0A4A3A] hover:bg-[#196A54]/10"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id
                      ? ""
                      : category.id
                  )
                }
                className={`rounded-full px-5 py-1.5 text-sm font-bold transition-all shrink-0 ${
                  selectedCategory === category.id
                    ? "border-2 border-[#0A4A3A] bg-[#0A4A3A] text-white shadow-md"
                    : "border border-[#196A54]/30 bg-[#F4F9F7] text-[#0A4A3A] hover:bg-[#196A54]/10"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* Course grid */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">🔍</div>

            <h3 className="mb-2 text-xl font-bold text-slate-900">
              No courses found
            </h3>

            <p className="mb-6 text-sm text-slate-500">
              Try adjusting your filters or search term.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setLevel("");
                setPriceFilter("");
              }}
              className="rounded-lg bg-[#196A54] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#12503F]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const badge = levelBadge(course.level);

              return (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-xl"
                >
                  {/* Thumbnail */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {course.thumbnailUrl ? (
                      <div className="relative h-full w-full animate-pulse bg-slate-200">
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-opacity duration-300"
                          unoptimized
                          onLoad={(event) => {
                            const target =
                              event.currentTarget as HTMLElement;

                            target.parentElement?.classList.remove(
                              "animate-pulse",
                              "bg-slate-200"
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <Image
                        src="/images/course-fallback.jpg"
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover"
                      />
                    )}

                    <div
                      className={`absolute left-4 top-4 rounded px-2.5 py-1 text-xs font-bold shadow-sm ${badge.cls}`}
                    >
                      {badge.label}
                    </div>

                    {course.priceCents === 0 && (
                      <div className="absolute right-4 top-4 rounded bg-[#196A54] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        Free
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    {course.category && (
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#196A54]">
                        {course.category.name}
                      </p>
                    )}

                    <Link href={`/courses/${course.id}`}>
                      <h3 className="mb-2 line-clamp-2 cursor-pointer text-lg font-bold leading-tight text-slate-900 transition-colors hover:text-[#196A54]">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="mb-4 text-sm text-slate-500">
                      {course.instructor.fullName}
                    </p>

                    <div className="mb-6 flex items-center gap-2 text-sm">
                      <span className="text-amber-400">
                        {"★".repeat(
                          Math.min(
                            5,
                            Math.max(
                              0,
                              Math.round(course.averageRating)
                            )
                          )
                        )}
                        {"☆".repeat(
                          Math.max(
                            0,
                            5 -
                              Math.min(
                                5,
                                Math.max(
                                  0,
                                  Math.round(course.averageRating)
                                )
                              )
                          )
                        )}
                      </span>

                      <span className="font-bold text-slate-900">
                        {course.averageRating > 0
                          ? course.averageRating.toFixed(1)
                          : "New"}
                      </span>

                      {course.reviewCount > 0 && (
                        <span className="text-slate-400">
                          ({course.reviewCount.toLocaleString()})
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-2xl font-extrabold text-[#0A4A3A]">
                        {formatPrice(course.priceCents)}
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          Details
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            course.priceCents === 0
                              ? handleEnrollFree(course.id)
                              : handleAddToCart(course.id)
                          }
                          disabled={cartAdding === course.id}
                          className="rounded-lg bg-[#196A54] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#12503F] disabled:opacity-60"
                        >
                          {cartAdding === course.id
                            ? "Adding..."
                            : course.priceCents === 0
                              ? "Enroll Free"
                              : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function LoadingCourses() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-sm text-slate-500">Loading courses...</p>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingCourses />}>
      <CoursesContent />
    </Suspense>
  );
}

