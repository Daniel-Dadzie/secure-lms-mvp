"use client";
import { useEffect, useState, Suspense } from "react";
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

function StudentBrowseCoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") ?? "");
  const [level, setLevel] = useState(searchParams.get("level") ?? "");
  const [priceFilter, setPriceFilter] = useState(searchParams.get("price") ?? "");
  const [cartAdding, setCartAdding] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());


  useEffect(() => {
    let cancelled = false;
    const loadCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (selectedCategory) params.set("categoryId", selectedCategory);
        const query = params.toString();
        const url = query ? `/courses?${query}&limit=12` : "/courses?limit=12";
        const res = await api.get(url);
        if (cancelled) return;
        setCourses(res.data.data ?? res.data ?? []);
        setTotal(res.data.total ?? (res.data.data ?? res.data ?? []).length);
      } catch {
        if (cancelled) return;
        setCourses([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadCourses();
    return () => { cancelled = true; };
  }, [search, selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (!cancelled) {
          setCategories(res.data.categories ?? res.data ?? []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    void loadCategories();
    return () => { cancelled = true; };
  }, []);

    useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/enrollments")
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.enrollments) ? raw.enrollments : [];
        setEnrolledCourseIds(new Set(list.map((e: any) => e.course?.id || e.courseId)));
      })
      .catch(() => {});
  }, [isAuthenticated]);


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
      // CHANGE HERE: Instead of redirecting to the video/classroom when already enrolled, 
      // gracefully push them to their learning dashboard or show a helpful message.
      if (msg.includes("enrolled") || err?.response?.status === 400) {
        router.push(`/student/my-learning`);
      } else if (msg.includes("cart")) {
        router.push("/cart");
      } else {
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
      router.push("/student/my-learning");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("enrolled")) {
        router.push("/student/my-learning");
      }
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (level && course.level !== level) return false;
    if (priceFilter === "free" && course.priceCents !== 0) return false;
    if (priceFilter === "paid" && course.priceCents === 0) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Browse Available Courses</h1>
        <p className="text-sm text-slate-500 mt-1">Explore engineering programs, add courses to your cart, and expand your skills.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#196A54]/30"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#196A54]/30 cursor-pointer"
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
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#196A54]/30 cursor-pointer"
          >
            <option value="">Any Price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="text-sm font-semibold text-slate-500 self-center">
          {loading ? "Loading..." : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} available`}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("")}
          className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all ${
            !selectedCategory ? "bg-[#196A54] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat.id ? "bg-[#196A54] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <p className="font-bold text-slate-700">No courses found matching your criteria</p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(""); setLevel(""); setPriceFilter(""); }}
            className="rounded-xl bg-[#196A54] px-5 py-2 text-xs font-bold text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const badge = levelBadge(course.level);
            return (
              <div key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <Image
                    src={course.thumbnailUrl || "/images/course-fallback.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute left-3 top-3 rounded px-2.5 py-1 text-[10px] font-bold shadow-sm ${badge.cls}`}>
                    {badge.label}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {course.category && (
                    <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#196A54]">
                      {course.category.name}
                    </p>
                  )}
                  <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-xs text-slate-500 font-medium">
                    {course.instructor?.fullName || "Instructor"}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xl font-extrabold text-[#0A4A3A]">
                      {course.priceCents === 0 ? "Free" : `$${(course.priceCents / 100).toFixed(2)}`}
                    </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Details
                        </Link>

                        {enrolledCourseIds.has(course.id) ? (
                          <Link
                            href={`/student/courses/${course.id}`}
                            className="rounded-lg bg-[#196A54] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#12503F] transition-colors text-center"
                          >
                            Continue
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => course.priceCents === 0 ? handleEnrollFree(course.id) : handleAddToCart(course.id)}
                            disabled={cartAdding === course.id}
                            className="rounded-lg bg-[#196A54] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#12503F] disabled:opacity-60 transition-colors"
                          >
                            {cartAdding === course.id ? "Adding..." : course.priceCents === 0 ? "Enroll Free" : "Add to Cart"}
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentBrowseCoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading catalog...</div>}>
      <StudentBrowseCoursesContent />
    </Suspense>
  );
}