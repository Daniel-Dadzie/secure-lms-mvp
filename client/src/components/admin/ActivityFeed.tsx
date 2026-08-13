"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import {
  getAuditActionLabel,
  getAuditEventDescription,
} from "@/lib/admin/auditLabels";
import { formatRelativeTime } from "@/lib/admin/formatters";
import type { AuditEvent } from "@/types/admin";

interface ActivityFeedProps {
  events: AuditEvent[];
  showViewAll?: boolean;
  emptyMessage?: string;
}

export function ActivityFeed({
  events,
  showViewAll = false,
  emptyMessage = "No recent activity.",
}: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Recent Platform Activity</h2>
        {showViewAll && (
          <Link
            href="/admin/activity-logs"
            className="text-sm font-semibold text-[#196A54] hover:underline"
          >
            View all logs
          </Link>
        )}
      </div>

      <div className="space-y-5">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">{emptyMessage}</p>
        ) : (
          events.slice(0, 10).map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 break-words">
                  {getAuditEventDescription(event)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getAuditActionLabel(event.action)}
                  {event.entityType && (
                    <span className="text-slate-400"> · {event.entityType}</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatRelativeTime(event.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
