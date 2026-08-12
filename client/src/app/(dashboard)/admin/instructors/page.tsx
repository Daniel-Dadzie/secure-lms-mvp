"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminInstructor } from "@/types/admin";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<AdminInstructor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/instructors", { params: { page, limit: 20 } });
      setInstructors(res.data.instructors ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Instructors</h1>
        <p className="text-sm text-slate-500 mt-1">Instructor directory and performance stats.</p>
      </div>

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map((inst) => (
              <div key={inst.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={inst.fullName} imageUrl={inst.avatarUrl} size="lg" className="ring-2 ring-[#196A54]/20" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 truncate">{inst.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{inst.specialization ?? "Instructor"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
                  <div>
                    <p className="text-lg font-extrabold text-[#0A4A3A]">{inst.stats.courses}</p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#0A4A3A]">{formatNumber(inst.stats.enrollments)}</p>
                    <p className="text-xs text-slate-500">Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#0A4A3A]">{inst.stats.completionRate}%</p>
                    <p className="text-xs text-slate-500">Completion</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#0A4A3A]">{formatCurrency(inst.stats.revenueCents)}</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                </div>
                <Link href={`/instructors/${inst.id}`} className="text-xs font-semibold text-[#196A54] hover:underline mt-4 inline-block">
                  View profile
                </Link>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
