"use client";

import {
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type { PlatformStats } from "@/types/admin";

interface AdminStatGridProps {
  stats: PlatformStats | null;
  loading: boolean;
  trends?: { users?: number; revenue?: number };
}

export function AdminStatGrid({ stats, loading, trends }: AdminStatGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Users",
      value: formatNumber(stats.users.total),
      icon: <Users className="h-5 w-5" />,
      trend: trends?.users !== undefined ? `↑ ${trends.users}% this month` : undefined,
      accent: "from-emerald-500/10 to-teal-50 border-emerald-200/80",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Total Courses",
      value: formatNumber(stats.courses.total),
      icon: <BookOpen className="h-5 w-5" />,
      accent: "from-blue-500/10 to-sky-50 border-blue-200/80",
      iconBg: "bg-blue-100 text-blue-700",
    },
    {
      label: "Active Instructors",
      value: formatNumber(stats.users.instructors),
      icon: <UserCheck className="h-5 w-5" />,
      accent: "from-violet-500/10 to-purple-50 border-violet-200/80",
      iconBg: "bg-violet-100 text-violet-700",
    },
    {
      label: "Active Students",
      value: formatNumber(stats.users.students),
      icon: <GraduationCap className="h-5 w-5" />,
      accent: "from-amber-500/10 to-orange-50 border-amber-200/80",
      iconBg: "bg-amber-100 text-amber-700",
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(stats.revenue.totalRevenueCents),
      icon: <DollarSign className="h-5 w-5" />,
      trend: trends?.revenue !== undefined ? `↑ ${trends.revenue}% this month` : undefined,
      accent: "from-[#0A4A3A]/10 to-[#F4F9F7] border-[#196A54]/30",
      iconBg: "bg-[#196A54]/15 text-[#0A4A3A]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          trend={card.trend}
          className={`bg-gradient-to-br ${card.accent} shadow-sm hover:shadow-md transition-shadow`}
          iconClassName={card.iconBg}
        />
      ))}
    </div>
  );
}
