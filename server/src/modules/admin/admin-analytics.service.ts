import type { UserRegion } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { USER_REGION_LABELS, USER_REGIONS } from "../../lib/regionFromTimezone";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  return months;
}

function startDateForMonths(months: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
}

function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function completionRate(completions: number, enrollments: number): number {
  if (enrollments === 0) return 0;
  return Math.round((completions / enrollments) * 1000) / 10;
}

function bucketEnrollmentsByMonth(
  rows: { enrolledAt: Date }[],
  months: string[]
): Record<string, number> {
  const counts = Object.fromEntries(months.map((m) => [m, 0]));
  for (const row of rows) {
    const key = monthKey(row.enrolledAt);
    if (key in counts) counts[key]++;
  }
  return counts;
}

function bucketCompletionsByMonth(
  rows: { completedAt: Date | null; enrolledAt: Date }[],
  months: string[]
): Record<string, number> {
  const counts = Object.fromEntries(months.map((m) => [m, 0]));
  for (const row of rows) {
    const date = row.completedAt ?? row.enrolledAt;
    const key = monthKey(date);
    if (key in counts) counts[key]++;
  }
  return counts;
}

async function countMonthlyActiveUsers(): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [progressUsers, enrollmentUsers] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { updatedAt: { gte: since }, user: { role: "STUDENT" } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.enrollment.findMany({
      where: { enrolledAt: { gte: since }, user: { role: "STUDENT" } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  const ids = new Set([
    ...progressUsers.map((u) => u.userId),
    ...enrollmentUsers.map((u) => u.userId),
  ]);
  return ids.size;
}

function buildRegionBreakdown(
  users: { region: UserRegion | null }[]
): { region: string; label: string; count: number }[] {
  const counts = Object.fromEntries(USER_REGIONS.map((r) => [r, 0])) as Record<UserRegion, number>;
  let unknown = 0;

  for (const user of users) {
    if (user.region && user.region in counts) {
      counts[user.region]++;
    } else {
      unknown++;
    }
  }

  const result: { region: string; label: string; count: number }[] = USER_REGIONS.map((region) => ({
    region,
    label: USER_REGION_LABELS[region],
    count: counts[region],
  }));

  if (unknown > 0) {
    result.push({ region: "UNKNOWN", label: "Unknown", count: unknown });
  }

  return result;
}

export async function getAnalyticsOverview(months = 6) {
  const monthLabels = lastNMonths(months);
  const from = startDateForMonths(months);

  const [
    students,
    purchases,
    enrollments,
    completedEnrollments,
    totalEnrollments,
    totalCompletions,
    monthlyActiveUsers,
    studentsByRegionRows,
    instructorsByRegionRows,
    categoryEnrollments,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: from } },
      select: { createdAt: true },
    }),
    prisma.purchase.findMany({
      where: { status: "COMPLETED", createdAt: { gte: from } },
      select: { createdAt: true, finalAmountCents: true },
    }),
    prisma.enrollment.findMany({
      where: { enrolledAt: { gte: from } },
      select: { enrolledAt: true },
    }),
    prisma.enrollment.findMany({
      where: { status: "COMPLETED", completedAt: { gte: from } },
      select: { completedAt: true, enrolledAt: true },
    }),
    prisma.enrollment.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.enrollment.count({ where: { status: "COMPLETED" } }),
    countMonthlyActiveUsers(),
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      select: { region: true },
    }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR", isActive: true },
      select: { region: true },
    }),
    prisma.enrollment.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        userId: true,
        course: { select: { category: { select: { name: true } } } },
      },
    }),
  ]);

  const regCounts: Record<string, number> = Object.fromEntries(monthLabels.map((m) => [m, 0]));
  for (const s of students) {
    const key = monthKey(s.createdAt);
    if (key in regCounts) regCounts[key]++;
  }
  const registrations = monthLabels.map((month) => ({
    month,
    count: regCounts[month],
  }));

  const revenueByMonth: Record<string, { revenueCents: number; purchaseCount: number }> =
    Object.fromEntries(monthLabels.map((m) => [m, { revenueCents: 0, purchaseCount: 0 }]));

  for (const p of purchases) {
    const key = monthKey(p.createdAt);
    if (key in revenueByMonth) {
      revenueByMonth[key].revenueCents += p.finalAmountCents;
      revenueByMonth[key].purchaseCount++;
    }
  }

  const revenue = monthLabels.map((month) => ({
    month,
    revenueCents: revenueByMonth[month].revenueCents,
    purchaseCount: revenueByMonth[month].purchaseCount,
  }));

  const enrollCounts = bucketEnrollmentsByMonth(enrollments, monthLabels);
  const enrollmentTrend = monthLabels.map((month) => ({
    month,
    count: enrollCounts[month],
  }));

  const completionCounts = bucketCompletionsByMonth(completedEnrollments, monthLabels);
  const completions = monthLabels.map((month) => ({
    month,
    count: completionCounts[month],
  }));

  const enrollmentVsCompletion = monthLabels.map((month) => ({
    month,
    enrollments: enrollCounts[month],
    completions: completionCounts[month],
  }));

  const categoryStudentMap = new Map<string, Set<string>>();
  for (const row of categoryEnrollments) {
    const categoryName = row.course.category?.name ?? "Uncategorized";
    if (!categoryStudentMap.has(categoryName)) {
      categoryStudentMap.set(categoryName, new Set());
    }
    categoryStudentMap.get(categoryName)!.add(row.userId);
  }
  const studentsByCategory = Array.from(categoryStudentMap.entries())
    .map(([category, studentIds]) => ({ category, count: studentIds.size }))
    .sort((a, b) => b.count - a.count);

  const currentMonth = monthLabels[monthLabels.length - 1];
  const previousMonth = monthLabels[monthLabels.length - 2];

  const newUsersThisMonth = regCounts[currentMonth] ?? 0;
  const newUsersPrevMonth = previousMonth ? regCounts[previousMonth] ?? 0 : 0;
  const revenueThisMonth = revenueByMonth[currentMonth]?.revenueCents ?? 0;
  const revenuePrevMonth = previousMonth
    ? revenueByMonth[previousMonth]?.revenueCents ?? 0
    : 0;

  return {
    registrations,
    revenue,
    enrollments: enrollmentTrend,
    completions,
    enrollmentVsCompletion,
    studentsByCategory,
    studentsByRegion: buildRegionBreakdown(studentsByRegionRows),
    instructorsByRegion: buildRegionBreakdown(instructorsByRegionRows),
    summary: {
      userGrowthPercent: growthPercent(newUsersThisMonth, newUsersPrevMonth),
      revenueGrowthPercent: growthPercent(revenueThisMonth, revenuePrevMonth),
      newUsersThisMonth,
      revenueThisMonthCents: revenueThisMonth,
      platformCompletionRate: completionRate(totalCompletions, totalEnrollments),
      monthlyActiveUsers,
    },
  };
}

export type TopCourseSort = "students" | "completions" | "revenue" | "ratings";

export async function getTopCourses(limit = 20, sort: TopCourseSort = "students") {
  const courses = await prisma.course.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      averageRating: true,
      reviewCount: true,
      instructor: { select: { fullName: true } },
      category: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const withStats = await Promise.all(
    courses.map(async (course) => {
      const [completions, rev] = await Promise.all([
        prisma.enrollment.count({
          where: { courseId: course.id, status: "COMPLETED" },
        }),
        prisma.purchase.aggregate({
          where: { courseId: course.id, status: "COMPLETED" },
          _sum: { finalAmountCents: true },
        }),
      ]);

      const enrollments = course._count.enrollments;
      return {
        id: course.id,
        title: course.title,
        instructorName: course.instructor.fullName,
        categoryName: course.category?.name ?? "Uncategorized",
        enrollments,
        completions,
        completionRate: completionRate(completions, enrollments),
        revenueCents: rev._sum.finalAmountCents ?? 0,
        averageRating: course.averageRating,
        reviewCount: course.reviewCount,
      };
    })
  );

  const sorted = [...withStats].sort((a, b) => {
    switch (sort) {
      case "completions":
        return b.completions - a.completions || b.enrollments - a.enrollments;
      case "revenue":
        return b.revenueCents - a.revenueCents || b.enrollments - a.enrollments;
      case "ratings":
        return b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;
      case "students":
      default:
        return b.enrollments - a.enrollments || b.revenueCents - a.revenueCents;
    }
  });

  return sorted.slice(0, limit);
}

export type TopInstructorSort = "completions" | "revenue" | "ratings";

export async function getTopInstructors(limit = 20, sort: TopInstructorSort = "completions") {
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR", isActive: true },
    select: {
      id: true,
      fullName: true,
      specialization: true,
      coursesTaught: {
        where: { isActive: true },
        select: {
          id: true,
          averageRating: true,
          reviewCount: true,
        },
      },
    },
  });

  const withStats = await Promise.all(
    instructors.map(async (inst) => {
      const courseIds = inst.coursesTaught.map((c) => c.id);
      const courseCount = courseIds.length;

      let enrollments = 0;
      let completions = 0;
      let revenueCents = 0;

      if (courseIds.length > 0) {
        const [enrollmentCount, completionCount, revenue] = await Promise.all([
          prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
          prisma.enrollment.count({
            where: { courseId: { in: courseIds }, status: "COMPLETED" },
          }),
          prisma.purchase.aggregate({
            where: { courseId: { in: courseIds }, status: "COMPLETED" },
            _sum: { finalAmountCents: true },
          }),
        ]);
        enrollments = enrollmentCount;
        completions = completionCount;
        revenueCents = revenue._sum.finalAmountCents ?? 0;
      }

      let totalReviews = 0;
      let weightedRatingSum = 0;
      for (const course of inst.coursesTaught) {
        totalReviews += course.reviewCount;
        weightedRatingSum += course.averageRating * course.reviewCount;
      }
      const averageRating =
        totalReviews > 0 ? Math.round((weightedRatingSum / totalReviews) * 10) / 10 : 0;

      return {
        id: inst.id,
        fullName: inst.fullName,
        specialization: inst.specialization,
        courseCount,
        enrollments,
        completions,
        completionRate: completionRate(completions, enrollments),
        revenueCents,
        averageRating,
        reviewCount: totalReviews,
      };
    })
  );

  const sorted = [...withStats].sort((a, b) => {
    switch (sort) {
      case "revenue":
        return b.revenueCents - a.revenueCents || b.completions - a.completions;
      case "ratings":
        return b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;
      case "completions":
      default:
        return b.completions - a.completions || b.revenueCents - a.revenueCents;
    }
  });

  return sorted.slice(0, limit);
}
