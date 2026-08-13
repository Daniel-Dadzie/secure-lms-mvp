"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { InstructorCourseTable } from "@/components/instructor/InstructorCourseTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { CourseStatus, InstructorCourse } from "@/types/instructor";

type StatusFilter = "ALL" | CourseStatus;

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  async function reloadCourses() {
    try {
      setLoading(true);
      const res = await api.get("/courses/instructor/mine");
      setCourses(res.data.courses ?? []);
      setError(null);
    } catch {
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
        const res = await api.get("/courses/instructor/mine");
        if (!cancelled) {
          setCourses(res.data.courses ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Could not load courses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  async function handlePublishToggle(courseId: string, currentStatus: CourseStatus) {
    if (currentStatus === "PUBLISHED") {
      await api.patch(`/courses/${courseId}/unpublish`);
    } else {
      await api.patch(`/courses/${courseId}/publish`);
    }
    await reloadCourses();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Create, edit, and publish your courses.</p>
        </div>
        <Link
          href="/instructor/courses/create"
          className="inline-flex items-center justify-center rounded-lg bg-[#196A54] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A4A3A] transition"
        >
          + Create Course
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <InstructorCourseTable courses={filtered} onPublishToggle={handlePublishToggle} />
      )}
    </div>
  );
}
