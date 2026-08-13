import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";
import { getInstructorOverview, getCourseAnalytics } from "../instructor-analytics/instructor-analytics.service";

async function getCourseAnalyticsForTrends(courseId: string) {
  const c = await getCourseAnalytics(courseId);
  return {
    totals: {
      totalEnrollments: c.enrollmentCount,
      totalCompletions: c.completionCount,
      totalRevenueCents: c.revenueCents,
    },
  };
}

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

async function getInstructorCourseIds(instructorId: string, courseId?: string): Promise<string[]> {
  const courses = await prisma.course.findMany({
    where: {
      instructorId,
      isActive: true,
      ...(courseId && { id: courseId }),
    },
    select: { id: true },
  });
  return courses.map((c) => c.id);
}

export async function listInstructorStudents(
  instructorId: string,
  filters: { page: number; limit: number; courseId?: string; search?: string }
) {
  const courseIds = await getInstructorCourseIds(instructorId, filters.courseId);
  if (courseIds.length === 0) {
    return { students: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
  }

  const where: Prisma.EnrollmentWhereInput = {
    courseId: { in: courseIds },
    status: { not: "CANCELLED" },
    ...(filters.search && {
      user: {
        OR: [
          { fullName: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      },
    }),
  };

  const skip = (filters.page - 1) * filters.limit;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        course: {
          select: {
            id: true,
            title: true,
            modules: { select: { lessons: { select: { id: true } } } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      skip,
      take: filters.limit,
    }),
    prisma.enrollment.count({ where }),
  ]);

  const students = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );
      let progressPercent = 0;
      if (enrollment.status === "COMPLETED") {
        progressPercent = 100;
      } else if (totalLessons > 0) {
        const completedLessons = await prisma.lessonProgress.count({
          where: { enrollmentId: enrollment.id, status: "COMPLETED" },
        });
        progressPercent = Math.round((completedLessons / totalLessons) * 100);
      }

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.user.id,
        fullName: enrollment.user.fullName,
        email: enrollment.user.email,
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        status: enrollment.status,
        progressPercent,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      };
    })
  );

  return {
    students,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function listInstructorReviews(
  instructorId: string,
  filters: { page: number; limit: number; courseId?: string }
) {
  const courseIds = await getInstructorCourseIds(instructorId, filters.courseId);
  if (courseIds.length === 0) {
    return { reviews: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
  }

  const where = { courseId: { in: courseIds }, isVisible: true };
  const skip = (filters.page - 1) * filters.limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        instructorReply: true,
        instructorReplyAt: true,
        createdAt: true,
        user: { select: { id: true, fullName: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function replyToReview(
  reviewId: string,
  instructorId: string,
  reply: string
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { course: { select: { instructorId: true, title: true } } },
  });

  if (!review || review.course.instructorId !== instructorId) {
    const error = new Error("Review not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { instructorReply: reply, instructorReplyAt: new Date() },
    select: {
      id: true,
      rating: true,
      comment: true,
      instructorReply: true,
      instructorReplyAt: true,
      createdAt: true,
      user: { select: { id: true, fullName: true } },
      course: { select: { id: true, title: true } },
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId: instructorId,
      action: "review.instructor_reply",
      entityType: "Review",
      entityId: reviewId,
      metadata: { courseId: review.courseId },
    },
  });

  return updated;
}

export async function getInstructorAnalyticsTrends(
  instructorId: string,
  months: number,
  courseId?: string
) {
  const courseIds = await getInstructorCourseIds(instructorId, courseId);
  const monthLabels = lastNMonths(months);
  const from = startDateForMonths(months);

  if (courseIds.length === 0) {
    return {
      months: monthLabels,
      enrollmentsByMonth: monthLabels.map((m) => ({ month: m, count: 0 })),
      completionsByMonth: monthLabels.map((m) => ({ month: m, count: 0 })),
      revenueByMonth: monthLabels.map((m) => ({ month: m, revenueCents: 0 })),
      averageRating: 0,
      summary: { totalEnrollments: 0, totalCompletions: 0, totalRevenueCents: 0 },
    };
  }

  const overviewPromise = courseId
    ? getCourseAnalyticsForTrends(courseId)
    : getInstructorOverview(instructorId);

  const [enrollments, purchases, reviews, overview] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds }, enrolledAt: { gte: from } },
      select: { enrolledAt: true, status: true, completedAt: true },
    }),
    prisma.purchase.findMany({
      where: {
        courseId: { in: courseIds },
        status: "COMPLETED",
        createdAt: { gte: from },
      },
      select: { createdAt: true, finalAmountCents: true },
    }),
    prisma.review.findMany({
      where: { courseId: { in: courseIds }, isVisible: true },
      select: { rating: true },
    }),
    overviewPromise,
  ]);

  const enrollmentCounts = Object.fromEntries(monthLabels.map((m) => [m, 0]));
  const completionCounts = Object.fromEntries(monthLabels.map((m) => [m, 0]));
  const revenueCounts = Object.fromEntries(monthLabels.map((m) => [m, 0]));

  for (const row of enrollments) {
    const key = monthKey(row.enrolledAt);
    if (key in enrollmentCounts) enrollmentCounts[key]++;
  }

  for (const row of enrollments) {
    if (row.status === "COMPLETED" && row.completedAt) {
      const key = monthKey(row.completedAt);
      if (key in completionCounts) completionCounts[key]++;
    }
  }

  for (const row of purchases) {
    const key = monthKey(row.createdAt);
    if (key in revenueCounts) revenueCounts[key] += row.finalAmountCents;
  }

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return {
    months: monthLabels,
    enrollmentsByMonth: monthLabels.map((m) => ({ month: m, count: enrollmentCounts[m] })),
    completionsByMonth: monthLabels.map((m) => ({ month: m, count: completionCounts[m] })),
    revenueByMonth: monthLabels.map((m) => ({ month: m, revenueCents: revenueCounts[m] })),
    enrollmentVsCompletion: monthLabels.map((m) => ({
      month: m,
      enrollments: enrollmentCounts[m],
      completions: completionCounts[m],
    })),
    averageRating,
    summary: overview.totals,
  };
}

export async function listInstructorEarnings(
  instructorId: string,
  filters: {
    page: number;
    limit: number;
    courseId?: string;
    from?: string;
    to?: string;
  }
) {
  const courseIds = await getInstructorCourseIds(instructorId, filters.courseId);
  if (courseIds.length === 0) {
    return {
      purchases: [],
      total: 0,
      page: filters.page,
      limit: filters.limit,
      totalPages: 0,
      summary: { totalRevenueCents: 0, totalPurchases: 0 },
    };
  }

  const where: Prisma.PurchaseWhereInput = {
    courseId: { in: courseIds },
    status: "COMPLETED",
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        }
      : {}),
  };

  const skip = (filters.page - 1) * filters.limit;

  const [purchases, total, revenueAgg] = await Promise.all([
    prisma.purchase.findMany({
      where,
      select: {
        id: true,
        finalAmountCents: true,
        amountCents: true,
        discountCents: true,
        createdAt: true,
        course: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true, email: true } },
        couponUsage: { select: { coupon: { select: { code: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
    }),
    prisma.purchase.count({ where }),
    prisma.purchase.aggregate({
      where,
      _sum: { finalAmountCents: true },
      _count: { _all: true },
    }),
  ]);

  return {
    purchases: purchases.map((p) => ({
      id: p.id,
      finalAmountCents: p.finalAmountCents,
      amountCents: p.amountCents,
      discountCents: p.discountCents,
      createdAt: p.createdAt,
      course: p.course,
      user: p.user,
      coupon: p.couponUsage?.coupon ?? null,
    })),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
    summary: {
      totalRevenueCents: revenueAgg._sum.finalAmountCents ?? 0,
      totalPurchases: revenueAgg._count._all,
    },
  };
}

const instructorProfileSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  avatarUrl: true,
  specialization: true,
  credentials: true,
  shortBio: true,
  bio: true,
  expertise: true,
  experienceYears: true,
  instructorCategory: true,
  region: true,
  createdAt: true,
} as const;

export async function getInstructorProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: instructorProfileSelect,
  });

  if (!user || !user.isActive) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return user;
}

export async function updateInstructorProfile(
  userId: string,
  input: {
    fullName?: string;
    avatarUrl?: string;
    specialization?: string;
    credentials?: string;
    shortBio?: string;
    bio?: string;
    expertise?: string[];
    experienceYears?: string;
    instructorCategory?: string;
    region?: "NORTH_AMERICA" | "LATIN_AMERICA" | "EUROPE" | "AFRICA" | "MIDDLE_EAST" | "ASIA_PACIFIC";
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl || null }),
      ...(input.specialization !== undefined && { specialization: input.specialization || null }),
      ...(input.credentials !== undefined && { credentials: input.credentials || null }),
      ...(input.shortBio !== undefined && { shortBio: input.shortBio || null }),
      ...(input.bio !== undefined && { bio: input.bio || null }),
      ...(input.expertise !== undefined && { expertise: input.expertise }),
      ...(input.experienceYears !== undefined && {
        experienceYears: input.experienceYears || null,
      }),
      ...(input.instructorCategory !== undefined && {
        instructorCategory: input.instructorCategory || null,
      }),
      ...(input.region !== undefined && { region: input.region }),
    },
    select: instructorProfileSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "user.profile_updated",
      entityType: "User",
      entityId: userId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return user;
}
