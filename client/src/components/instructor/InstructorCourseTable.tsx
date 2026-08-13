"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import type { InstructorCourse, CourseStatus } from "@/types/instructor";

interface InstructorCourseTableProps {
  courses: InstructorCourse[];
  onPublishToggle: (courseId: string, currentStatus: CourseStatus) => Promise<void>;
}

function statusVariant(status: CourseStatus): "green" | "amber" | "slate" {
  if (status === "PUBLISHED") return "green";
  if (status === "DRAFT") return "amber";
  return "slate";
}

export function InstructorCourseTable({ courses, onPublishToggle }: InstructorCourseTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleToggle(courseId: string, status: CourseStatus) {
    setActionLoading(courseId);
    try {
      await onPublishToggle(courseId, status);
    } finally {
      setActionLoading(null);
    }
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="Create your first course or adjust your filters."
        action={
          <Link
            href="/instructor/courses/create"
            className="rounded-lg bg-[#196A54] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create Course
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[800px] w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Title</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Category</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Enrollments</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Price</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Created</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 max-w-[200px] truncate">
                {course.title}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{course.category?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(course.status)}>{course.status}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 text-center">
                {course._count?.enrollments ?? 0}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {course.priceCents === 0 ? "Free" : formatCurrency(course.priceCents)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(course.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/instructor/courses/${course.id}/edit`}
                    className="inline-flex h-8 items-center px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  {course.status !== "ARCHIVED" && (
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex h-8 items-center px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                    >
                      Preview
                    </Link>
                  )}
                  {course.status !== "ARCHIVED" && (
                    <Button
                      size="sm"
                      variant={course.status === "PUBLISHED" ? "outline" : "primary"}
                      className="h-8"
                      isLoading={actionLoading === course.id}
                      onClick={() => handleToggle(course.id, course.status)}
                    >
                      {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
