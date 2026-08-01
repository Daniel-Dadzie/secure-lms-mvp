import { prisma } from "../../config/prisma";

// ----------------------------------------------------------------------------
// Live-computed instructor analytics.
// Field names deliberately match the InstructorAnalytics schema
// (enrollmentCount, completionCount, revenueCents, averageProgress) so that
// a future snapshot/cron job can populate that table without changing this
// module's API contract — callers won't need to know whether the data is
// computed live or read from a pre-aggregated snapshot.
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Stats for a single course. Caller must already be verified as the owning
// instructor (or admin) via requireOwnership("course") at the route level.
// ----------------------------------------------------------------------------
export async function getCourseAnalytics(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      modules: {
        select: { lessons: { select: { id: true } } },
      },
    },
  });

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  // Enrollment counts, grouped by status in one query rather than three
  const enrollmentsByStatus = await prisma.enrollment.groupBy({
    by: ["status"],
    where: { courseId },
    _count: { _all: true },
  });

  const enrollmentCount = enrollmentsByStatus.reduce((sum, row) => sum + row._count._all, 0);
  const completionCount =
    enrollmentsByStatus.find((row) => row.status === "COMPLETED")?._count._all ?? 0;

  // Revenue: sum of finalAmountCents across completed purchases for this course
  const revenueResult = await prisma.purchase.aggregate({
    where: { courseId, status: "COMPLETED" },
    _sum: { finalAmountCents: true },
  });
  const revenueCents = revenueResult._sum.finalAmountCents ?? 0;

  // Average progress across non-cancelled enrollments.
  // COMPLETED enrollments count as 100% regardless of lesson count edge cases;
  // ACTIVE enrollments are computed from actual completed lesson counts.
  let averageProgress = 0;

  if (totalLessons > 0) {
    const activeAndCompleted = await prisma.enrollment.findMany({
      where: { courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: { id: true, status: true },
    });

    if (activeAndCompleted.length > 0) {
      const progressPercents = await Promise.all(
        activeAndCompleted.map(async (enrollment) => {
          if (enrollment.status === "COMPLETED") return 100;

          const completedLessons = await prisma.lessonProgress.count({
            where: { enrollmentId: enrollment.id, status: "COMPLETED" },
          });

          return Math.round((completedLessons / totalLessons) * 100);
        })
      );

      averageProgress =
        Math.round(
          (progressPercents.reduce((sum, p) => sum + p, 0) / progressPercents.length) * 10
        ) / 10;
    }
  }

  return {
    courseId: course.id,
    courseTitle: course.title,
    enrollmentCount,
    completionCount,
    revenueCents,
    averageProgress,
  };
}

// ----------------------------------------------------------------------------
// Overview across ALL of an instructor's courses — one row per course,
// same shape as getCourseAnalytics, plus a totals summary.
// ----------------------------------------------------------------------------
export async function getInstructorOverview(instructorId: string) {
  const courses = await prisma.course.findMany({
    where: { instructorId, isActive: true },
    select: { id: true },
  });

  const perCourse = await Promise.all(
    courses.map((c) => getCourseAnalytics(c.id))
  );

  const totals = perCourse.reduce(
    (acc, c) => ({
      totalEnrollments: acc.totalEnrollments + c.enrollmentCount,
      totalCompletions: acc.totalCompletions + c.completionCount,
      totalRevenueCents: acc.totalRevenueCents + c.revenueCents,
    }),
    { totalEnrollments: 0, totalCompletions: 0, totalRevenueCents: 0 }
  );

  return {
    courses: perCourse,
    totals,
  };
}