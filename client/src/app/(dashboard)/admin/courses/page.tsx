"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { CourseTable } from "@/components/admin/CourseTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { AdminCourse, CourseStatus } from "@/types/admin";

type StatusFilter = "ALL" | CourseStatus;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  async function reloadCourses() {
    try {
      setLoading(true);
      const res = await api.get("/admin/courses");
      setCourses(res.data.courses ?? []);
      setError(null);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError("Could not load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/admin/courses");
        if (!cancelled) {
          setCourses(res.data.courses ?? []);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        if (!cancelled) {
          setError("Could not load courses.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !search || course.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  async function handleArchive(courseId: string) {
    await api.delete(`/courses/${courseId}`);
    await reloadCourses();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage all courses across the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <CourseTable courses={filteredCourses} onArchive={handleArchive} />
      )}
    </div>
  );
}
