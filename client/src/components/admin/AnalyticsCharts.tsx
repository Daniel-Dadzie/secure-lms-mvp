"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EnrollmentVsCompletionPoint, RegionBreakdown } from "@/types/admin";

const REGION_COLORS: Record<string, string> = {
  NORTH_AMERICA: "#0A4A3A",
  LATIN_AMERICA: "#F97316",
  EUROPE: "#2563EB",
  AFRICA: "#7C3AED",
  MIDDLE_EAST: "#DC2626",
  ASIA_PACIFIC: "#06B6D4",
  UNKNOWN: "#94A3B8",
};

interface EnrollmentCompletionChartProps {
  data: EnrollmentVsCompletionPoint[];
}

export function EnrollmentCompletionChart({ data }: EnrollmentCompletionChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(5),
    enrollments: d.enrollments,
    completions: d.completions,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Enrollments vs Completions</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="enrollments" name="Enrollments" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completions" name="Completions" fill="#196A54" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface CategoryBarChartProps {
  data: { category: string; count: number }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((d) => ({ category: d.category, students: d.count }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Students by Category</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="students" fill="#0A4A3A" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface RegionDonutChartProps {
  title: string;
  data: RegionBreakdown[];
}

export function RegionDonutChart({ title, data }: RegionDonutChartProps) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: d.label,
    value: d.count,
    region: d.region,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.region}
                  fill={REGION_COLORS[entry.region] ?? REGION_COLORS.UNKNOWN}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface UserGrowthRevenueChartProps {
  registrations: { month: string; count?: number }[];
  revenue: { month: string; revenueCents?: number }[];
}

export function UserGrowthRevenueChart({ registrations, revenue }: UserGrowthRevenueChartProps) {
  const chartData = registrations.map((reg, i) => ({
    month: reg.month.slice(5),
    users: reg.count ?? 0,
    revenue: (revenue[i]?.revenueCents ?? 0) / 100,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">User Growth & Revenue</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "revenue" ? [`$${value.toLocaleString()}`, "Revenue"] : [value, "New Users"]
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="users" name="New Users" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
