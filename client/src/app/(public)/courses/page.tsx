"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  priceCents: number;
  averageRating: number;
  reviewCount: number;
  level: string;
  instructor: { id: string; fullName: string };
  category: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { courses: number };
}

interface CoursesResponse {
  data: Course[];
  total: number;
  page: number;
  totalPages: number;
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
  return { cls: map[level] ?? "bg-slate-100 text-slate-700", label: label[level] ?? level };
}

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state — initialised from URL params
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") ?? "");
  const [level, setLevel] = useState(searchParams.get("level") ?? "");
  const [priceFilter, setPriceFilter] = useState(searchParams.get("price") ?? "");
  const [cartAdding, setCartAdding] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      const res = await api.get<CoursesResponse>(`/courses?${params.toString()}&limit=12`);
      setCourses(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.categories ?? []);
    }).catch(() => {});
  }, []);

  async function handleAddToCart(courseId: string) {
    if (!isAuthenticated) { router.push("/login"); return; }
    setCartAdding(courseId);
    try {
      await api.post("/cart/items", { courseId });
      router.push("/cart");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("enrolled")) router.push(`/learn/${courseId}`);
      else if (msg.includes("cart")) router.push("/cart");
    } finally {
      setCartAdding(null);
    }
  }

  async function handleEnrollFree(courseId: string) {
    if (!isAuthenticated) { router.push("/login"); return; }
    try {
      await api.post("/enrolments/free", { courseId });
      router.push("/student");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("enrolled")) router.push("/student");
    }
  }

  const filteredCourses = courses.filter((c) => {
    if (level && c.level !== level) return false;
    if (priceFilter === "free" && c.priceCents !== 0) return false;
    if (priceFilter === "paid" && c.priceCents === 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F9F7]">

      {/* Hero banner */}
      <section className="bg-[#0A4A3A] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[#C2F25B] text-sm font-bold tracking-widest uppercase mb-3">Course Catalogue</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Browse Engineering Courses</h1>
          <p className="text-teal-50 text-lg max-w-2xl">
            {total > 0 ? `${total}+ industry-relevant courses` : "Industry-relevant courses"} taught by world-class engineers. Learn at your own pace.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-20 z-40 shadow-sm">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#196A54]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCourses()}
                  className="pl-10 pr-4 py-2 border border-[#196A54]/20 rounded-full text-sm w-64 text-slate-700 placeholder-[#196A54]/50 outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:border-[#0A4A3A] transition-all"
                />
              </div>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-4 py-2 border border-[#196A54]/20 rounded-full text-sm text-[#0A4A3A] font-medium bg-white outline-none focus:ring-2 focus:ring-[#0A4A3A] cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 border border-[#196A54]/20 rounded-full text-sm text-[#0A4A3A] font-medium bg-white outline-none focus:ring-2 focus:ring-[#0A4A3A] cursor-pointer"
              >
                <option value="">Any Price</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
              {loading ? "Loading..." : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} found`}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                !selectedCategory ? "bg-[#0A4A3A] text-white" : "bg-[#F4F9F7] text-[#0A4A3A] border border-[#196A54]/30 hover:bg-[#196A54]/10"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#0A4A3A] text-white border-2 border-[#0A4A3A] shadow-md"
                    : "bg-[#F4F9F7] text-[#0A4A3A] border border-[#196A54]/30 hover:bg-[#196A54]/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory(""); setLevel(""); setPriceFilter(""); }}
              className="px-6 py-2.5 bg-[#196A54] text-white rounded-lg text-sm font-bold hover:bg-[#12503F] transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const badge = levelBadge(course.level);
              return (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  
                  {/* THUMBNAIL WRAPPER */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {course.thumbnailUrl ? (
                      <div className="relative w-full h-full animate-pulse bg-slate-200">
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-opacity duration-300"
                          unoptimized
                          onLoad={(e) => {
                            const target = e.target as HTMLElement;
                            target.parentElement?.classList.remove('animate-pulse', 'bg-slate-200');
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
                    
                    <div className={`absolute top-4 left-4 px-2.5 py-1 rounded text-xs font-bold shadow-sm ${badge.cls}`}>
                      {badge.label}
                    </div>
                    {course.priceCents === 0 && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded text-xs font-bold bg-[#196A54] text-white shadow-sm">
                        Free
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {course.category && (
                      <p className="text-xs font-bold text-[#196A54] uppercase tracking-wider mb-2">
                        {course.category.name}
                      </p>
                    )}
                    <Link href={`/courses/${course.id}`}>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2 hover:text-[#196A54] transition-colors cursor-pointer">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500 mb-4">{course.instructor.fullName}</p>

                    <div className="flex items-center gap-2 mb-6 text-sm">
                      <span className="text-amber-400">
                        {"★".repeat(Math.round(course.averageRating))}
                        {"☆".repeat(5 - Math.round(course.averageRating))}
                      </span>
                      <span className="font-bold text-slate-900">
                        {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
                      </span>
                      {course.reviewCount > 0 && (
                        <span className="text-slate-400">({course.reviewCount.toLocaleString()})</span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-2xl font-extrabold text-[#0A4A3A]">
                        {course.priceCents === 0 ? "Free" : `$${(course.priceCents / 100).toFixed(0)}`}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => course.priceCents === 0 ? handleEnrollFree(course.id) : handleAddToCart(course.id)}
                          disabled={cartAdding === course.id}
                          className="px-4 py-2 bg-[#196A54] text-white rounded-lg text-sm font-bold hover:bg-[#12503F] transition-colors shadow-sm disabled:opacity-60"
                        >
                          {cartAdding === course.id ? "Adding..." : course.priceCents === 0 ? "Enroll Free" : "Add to Cart"}
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

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center"><p className="text-slate-500">Loading courses...</p></div>}>
      <CoursesContent />
    </Suspense>
  );
}