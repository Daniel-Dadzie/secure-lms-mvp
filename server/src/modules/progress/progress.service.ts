import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";

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

  // Check course completion if lesson was just completed
  if (status === "COMPLETED") {
    await checkCourseCompletion(userId, courseId, enrollment.id);
  }

  return progress;
}

// ----------------------------------------------------------------------------
// Check if all lessons in a course are completed.
// If so: mark enrollment COMPLETED + issue certificate.
// ----------------------------------------------------------------------------
async function checkCourseCompletion(
  userId: string,
  courseId: string,
  enrollmentId: string
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

    // Notify the student
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