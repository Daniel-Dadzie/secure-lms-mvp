"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ReportCard } from "@/components/admin/ReportCard";
import { downloadReport } from "@/lib/admin/downloadReport";
import type { ReportsSummary } from "@/types/admin";

const REPORTS = [
  { type: "users", title: "Users Report", description: "All platform users with roles and status.", key: "users" as const },
  { type: "courses", title: "Courses Report", description: "All courses with enrollments and revenue.", key: "courses" as const },
  { type: "purchases", title: "Purchases Report", description: "Transaction history with amounts and status.", key: "purchases" as const },
  { type: "enrollments", title: "Enrollments Report", description: "Student enrollments across all courses.", key: "enrollments" as const },
  { type: "audit-log", title: "Audit Log Report", description: "Platform activity and admin actions.", key: "auditEvents" as const },
];

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/reports/summary").then((res) => setSummary(res.data.summary));
  }, []);

  async function handleDownload(type: string) {
    setDownloading(type);
    try {
      await downloadReport(type, `${type}.csv`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Export platform data as CSV files.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((report) => (
          <ReportCard
            key={report.type}
            title={report.title}
            description={report.description}
            rowCount={summary?.[report.key]}
            loading={downloading === report.type}
            onDownload={() => handleDownload(report.type)}
          />
        ))}
      </div>
    </div>
  );
}
