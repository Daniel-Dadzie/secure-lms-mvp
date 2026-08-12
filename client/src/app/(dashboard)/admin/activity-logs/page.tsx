"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { AUDIT_ACTION_OPTIONS } from "@/lib/admin/auditLabels";
import type { AuditLogResponse } from "@/types/admin";

const PAGE_SIZE = 20;

export default function AdminActivityLogsPage() {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (actionFilter) {
        params.action = actionFilter;
      }

      const res = await api.get("/admin/audit-log", { params });
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError("Could not load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Activity Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review platform audit events and admin actions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        >
          {AUDIT_ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {data && (
          <p className="text-sm text-slate-500">
            {data.total} total event{data.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <>
          <AuditLogTable events={data?.events ?? []} />
          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
