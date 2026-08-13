"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyDataPoint } from "@/types/admin";
import { formatCurrency } from "@/lib/admin/formatters";

interface RevenueChartProps {
  data: MonthlyDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(5),
    revenue: (d.revenueCents ?? 0) / 100,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Monthly Revenue</h3>
      <div className="h-56 sm:h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
            <Bar dataKey="revenue" fill="#0A4A3A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
