"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import type { AdminCourse, CourseStatus } from "@/types/admin";

interface CourseTableProps {
  courses: AdminCourse[];
  onArchive: (courseId: string) => Promise<void>;
}

function statusVariant(status: CourseStatus): "green" | "amber" | "slate" {
  if (status === "PUBLISHED") return "green";
  if (status === "DRAFT") return "amber";
  return "slate";
}

const stickyActionsHeader =
  "sticky right-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]";
const stickyActionsCell =
  "sticky right-0 z-10 bg-white px-4 py-3 whitespace-nowrap align-middle shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)] group-hover:bg-slate-50/80";

export function CourseTable({ courses, onArchive }: CourseTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  async function handleArchive(courseId: string) {
    setActionLoading(courseId);
    try {
      await onArchive(courseId);
      setConfirmArchiveId(null);
    } finally {
      setActionLoading(null);
    }
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Instructor
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Enrollments
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Created
              </th>
              <th className={stickyActionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course.id} className="group hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 max-w-[200px] truncate">
                  {course.title}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[140px] truncate">
                  {course.instructor.fullName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[120px] truncate">
                  {course.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={statusVariant(course.status)}>{course.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-center">
                  {course._count.enrollments}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {course.priceCents === 0
                    ? "Free"
                    : formatCurrency(course.priceCents)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {formatDateTime(course.createdAt)}
                </td>
                <td className={stickyActionsCell}>
                  <div className="flex flex-row flex-nowrap items-center gap-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex h-8 items-center justify-center px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      View
                    </Link>
                    {course.status !== "ARCHIVED" && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="h-8 whitespace-nowrap"
                        onClick={() => setConfirmArchiveId(course.id)}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Course</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will archive the course and hide it from the catalog. This action can be reversed from the backend.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmArchiveId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={actionLoading === confirmArchiveId}
                onClick={() => handleArchive(confirmArchiveId)}
              >
                Archive Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
