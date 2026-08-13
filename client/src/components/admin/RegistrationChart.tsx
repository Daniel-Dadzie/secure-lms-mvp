"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyDataPoint } from "@/types/admin";

interface RegistrationChartProps {
  data: MonthlyDataPoint[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(5),
    count: d.count ?? 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">User Registrations</h3>
      <div className="h-56 sm:h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: "#1D4ED8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
