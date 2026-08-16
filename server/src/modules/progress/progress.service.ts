import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";
import { logActivity, logActivityOnce } from "../../lib/activityLog";
import type { Prisma } from "@prisma/client";

// ----------------------------------------------------------------------------
// Update lesson progress — marks IN_PROGRESS or COMPLETED.
// After marking COMPLETED, checks if all lessons in the course are done.
// If so, marks the enrollment as COMPLETED and issues a certificate.
// ----------------------------------------------------------------------------
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  status: "IN_PROGRESS" | "COMPLETED",
  progressSeconds: number
) {
  // Verify the lesson exists and student is enrolled
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      module: {
        select: {
          courseId: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const courseId = lesson.module.courseId;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === "CANCELLED") {
    const error = new Error("You are not enrolled in this course");
    (error as any).statusCode = 403;
    throw error;
  }

  // Update progress
  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      status,
      progressSeconds,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    create: {
      userId,
      lessonId,
      enrollmentId: enrollment.id,
      status,
      progressSeconds,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  // Check course completion and progress milestones if lesson was just completed
  if (status === "COMPLETED") {
    await logActivity({
      userId,
      title: `Completed "${lesson.title}"`,
      description: lesson.module.course.title,
      iconType: "completed",
    });

    await notifyProgressMilestones(
      userId,
      courseId,
      lesson.module.course.title,
      enrollment.id
    );
    await checkCourseCompletion(userId, courseId, enrollment.id, lesson.module.course.title);
  }

  return progress;
}

const PROGRESS_MILESTONES = [25, 50, 75] as const;

async function notifyProgressMilestones(
  userId: string,
  courseId: string,
  courseTitle: string,
  enrollmentId: string
): Promise<void> {
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  });

  if (totalLessons === 0) return;

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      enrollmentId,
      status: "COMPLETED",
      lesson: { module: { courseId } },
    },
  });

  const percent = Math.round((completedLessons / totalLessons) * 100);

  // Calculate the previous percentage (before this lesson was completed)
  const previousPercent = Math.round(((completedLessons - 1) / totalLessons) * 100);

  for (const milestone of PROGRESS_MILESTONES) {
    // Only notify if we just crossed this milestone (previous < milestone <= current)
    if (previousPercent >= milestone || percent < milestone) continue;

    // Check if notification already exists for this specific enrollment and milestone
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: "PLATFORM_ALERT",
        metadata: {
          equals: {
            kind: "progress_milestone",
            courseId,
            milestone,
            enrollmentId,
          },
        },
      },
    });

    if (existing) continue;

    // Use transaction to ensure atomic notification creation
    await prisma.$transaction(async (tx) => {
      // Double-check within transaction to prevent race conditions
      const existingInTx = await tx.notification.findFirst({
        where: {
          userId,
          type: "PLATFORM_ALERT",
          metadata: {
            equals: {
              kind: "progress_milestone",
              courseId,
              milestone,
              enrollmentId,
            },
          },
        },
      });

      if (existingInTx) return;

      await createNotification(
        userId,
        "PLATFORM_ALERT",
        `${milestone}% milestone reached`,
        `You've completed ${milestone}% of "${courseTitle}". Keep up the great work!`,
        {
          kind: "progress_milestone",
          courseId,
          milestone,
          enrollmentId,
          progressPercent: percent,
        }
      );

      // Log activity with enrollmentId to prevent duplicates for same enrollment
      const existingActivity = await tx.activity.findFirst({
        where: {
          userId,
          iconType: "badge",
          title: `Reached ${milestone}% in "${courseTitle}"`,
        },
        select: { id: true },
      });

      if (!existingActivity) {
        await tx.activity.create({
          data: {
            userId,
            title: `Reached ${milestone}% in "${courseTitle}"`,
            description: `${completedLessons} of ${totalLessons} lessons complete`,
            iconType: "badge",
            metadata: {
              courseId,
              milestone,
              enrollmentId,
            } as Prisma.InputJsonValue,
          },
        });
      }
    });
  }
}

// ----------------------------------------------------------------------------
// Check if all lessons in a course are completed.
// If so: mark enrollment COMPLETED + issue certificate.
// ----------------------------------------------------------------------------
async function checkCourseCompletion(
  userId: string,
  courseId: string,
  enrollmentId: string,
  courseTitle: string
): Promise<void> {
  // Count total lessons in the course
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  });

  if (totalLessons === 0) return;

  // Count completed lessons for this student
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      enrollmentId,
      status: "COMPLETED",
      lesson: { module: { courseId } },
    },
  });

  if (completedLessons < totalLessons) return;

  // All lessons done — mark enrollment completed and issue certificate
  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Issue certificate (idempotent — skip if already exists)
    const existingCert = await tx.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!existingCert) {
      await tx.certificate.create({
        data: { userId, courseId },
      });

      await createNotification(
        userId,
        "CERTIFICATE_ISSUED",
        "Certificate earned!",
        `Congratulations — you've earned a certificate for completing the course.`,
        { courseId }
      );
    }

    await tx.auditEvent.create({
      data: {
        userId,
        action: "enrollment.completed",
        entityType: "Enrollment",
        entityId: enrollmentId,
        metadata: { courseId, totalLessons, completedLessons },
      },
    });
  });

  if (completedLessons >= totalLessons) {
    await logActivityOnce({
      userId,
      title: `Completed course "${courseTitle}"`,
      description: "Certificate earned",
      iconType: "certificate",
    });
  }
}

// ----------------------------------------------------------------------------
// Get progress for all lessons in an enrollment
// ----------------------------------------------------------------------------
export async function getEnrollmentProgress(
  userId: string,
  enrollmentId: string
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });

  if (!enrollment || enrollment.userId !== userId) {
    const error = new Error("Enrollment not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return prisma.lessonProgress.findMany({
    where: { enrollmentId },
    select: {
      id: true,
      lessonId: true,
      status: true,
      progressSeconds: true,
      completedAt: true,
      lesson: {
        select: { id: true, title: true, order: true, durationSeconds: true },
      },
    },
    orderBy: { lesson: { order: "asc" } },
  });
}

// ----------------------------------------------------------------------------
// Get student's certificates
// ----------------------------------------------------------------------------
export async function getStudentCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: { select: { id: true, fullName: true } },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });
}
