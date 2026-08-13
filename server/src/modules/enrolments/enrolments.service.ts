import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";
import { logActivity } from "../../lib/activityLog";

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  purchaseId: true,
  status: true,
  enrolledAt: true,
  completedAt: true,
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      averageRating: true,
      reviewCount: true,
      instructor: { select: { id: true, fullName: true } },
      modules: {
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            select: { id: true, title: true, order: true, durationSeconds: true },
            orderBy: { order: "asc" as const },
          },
        },
        orderBy: { order: "asc" as const },
      },
    },
  },
} as const;

// ----------------------------------------------------------------------------
// Get all enrollments for the current student with progress
// ----------------------------------------------------------------------------
export async function getStudentEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    select: enrollmentSelect,
    orderBy: { enrolledAt: "desc" },
  });

  // Attach progress percentage and per-lesson breakdown to each enrollment
  const enriched = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );

      const lessonProgress = await prisma.lessonProgress.findMany({
        where: { enrollmentId: enrollment.id },
        select: {
          lessonId: true,
          status: true,
          completedAt: true,
          updatedAt: true,
        },
      });

      const completedLessons = lessonProgress.filter(
        (p) => p.status === "COMPLETED"
      ).length;

      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      const lastAccessedAt = lessonProgress.reduce<Date | null>((latest, p) => {
        if (!latest || p.updatedAt > latest) return p.updatedAt;
        return latest;
      }, null);

      return {
        ...enrollment,
        progressPercent,
        lessonProgress: lessonProgress.map(({ lessonId, status, completedAt }) => ({
          lessonId,
          status,
          completedAt,
        })),
        progressDetails: {
          completedLessons,
          totalLessons,
          progressPercent,
        },
        lastAccessedAt:
          lastAccessedAt?.toISOString() ?? enrollment.enrolledAt.toISOString(),
      };
    })
  );

  return enriched;
}

// ----------------------------------------------------------------------------
// Get single enrollment detail with full progress breakdown
// ----------------------------------------------------------------------------
export async function getEnrollmentById(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      ...enrollmentSelect,
      progress: {
        select: {
          id: true,
          lessonId: true,
          status: true,
          progressSeconds: true,
          completedAt: true,
        },
      },
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (enrollment.userId !== userId) {
    const error = new Error("Enrollment not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return enrollment;
}

// ----------------------------------------------------------------------------
// Free course enrollment (priceCents === 0, no purchase needed)
// ----------------------------------------------------------------------------
export async function enrollFree(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      status: "PUBLISHED",
      isActive: true,
      priceCents: 0,
    },
    select: {
      id: true,
      title: true,
      instructorId: true,
      modules: {
        select: { lessons: { select: { id: true } } },
      },
    },
  });

  if (!course) {
    const error = new Error("Course not found or not a free course");
    (error as any).statusCode = 404;
    throw error;
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    const error = new Error("Already enrolled in this course");
    (error as any).statusCode = 409;
    throw error;
  }

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  const enrollment = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: { userId, courseId, status: "ACTIVE" },
    });

    if (lessonIds.length > 0) {
      await tx.lessonProgress.createMany({
        data: lessonIds.map((lessonId) => ({
          userId,
          lessonId,
          enrollmentId: enrollment.id,
          status: "NOT_STARTED",
          progressSeconds: 0,
        })),
        skipDuplicates: true,
      });
    }

    await tx.auditEvent.create({
      data: {
        userId,
        action: "enrollment.free",
        entityType: "Enrollment",
        entityId: enrollment.id,
        metadata: { courseId, courseTitle: course.title },
      },
    });

    await createNotification(
      userId,
      "ENROLLMENT_CONFIRMED",
      "Enrollment confirmed",
      `You're now enrolled in ${course.title}.`,
      { courseId }
    );

    await createNotification(
      course.instructorId,
      "NEW_ENROLLMENT",
      "New student enrolled",
      `A student enrolled in your course "${course.title}".`,
      { courseId, enrollmentId: enrollment.id }
    );

    return enrollment;
  });

  await logActivity({
    userId,
    title: `Enrolled in "${course.title}"`,
    description: "Free enrollment",
    iconType: "enrolled",
  });

  return enrollment;
}