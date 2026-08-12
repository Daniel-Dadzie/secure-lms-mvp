"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReportCardProps {
  title: string;
  description: string;
  rowCount?: number;
  onDownload: () => void;
  loading?: boolean;
}

export function ReportCard({
  title,
  description,
  rowCount,
  onDownload,
  loading,
}: ReportCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 flex-1">{description}</p>
      {rowCount !== undefined && (
        <p className="text-xs text-slate-400 mt-3">{rowCount.toLocaleString()} records</p>
      )}
      <Button
        className="mt-4 bg-[#0A4A3A] hover:bg-[#12503F] w-full"
        onClick={onDownload}
        isLoading={loading}
      >
        <Download className="w-4 h-4 mr-2 inline" />
        Download CSV
      </Button>
    </div>
  );
}
