"use client";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuditActionLabel } from "@/lib/admin/auditLabels";
import { formatDateTime } from "@/lib/admin/formatters";
import type { AuditEvent } from "@/types/admin";

interface AuditLogTableProps {
  events: AuditEvent[];
}

export function AuditLogTable({ events }: AuditLogTableProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No activity logs"
        description="No audit events match your current filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {["Timestamp", "User", "Action", "Entity", "Entity ID", "IP"].map(
              (header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                {formatDateTime(event.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                {event.user ? (
                  <div>
                    <p className="font-semibold text-slate-900">{event.user.fullName}</p>
                    <p className="text-xs text-slate-500">{event.user.email}</p>
                  </div>
                ) : (
                  <span className="text-slate-400">System</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                {getAuditActionLabel(event.action)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {event.entityType ? (
                  <Badge variant="slate">{event.entityType}</Badge>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-[120px] truncate">
                {event.entityId ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                {event.ipAddress ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
