import { prisma } from "../../config/prisma";
import type { CreateLessonInput, UpdateLessonInput, ReorderLessonsInput } from "./lessons.schemas";

const lessonSelect = {
  id: true,
  moduleId: true,
  title: true,
  order: true,
  durationSeconds: true,
  contentUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ----------------------------------------------------------------------------
// Get lesson — checks enrollment before returning contentUrl
// Non-enrolled students get lesson metadata but NOT the video URL
// This enforces access control at the data layer, not just the route layer
// ----------------------------------------------------------------------------
export async function getLessonById(lessonId: string, userId: string, userRole: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      ...lessonSelect,
      module: {
        select: {
          courseId: true,
          course: {
            select: { instructorId: true, status: true },
          },
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
  const isInstructor = lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "ADMIN";

  // Instructors and admins always have full access
  if (isInstructor || isAdmin) {
    return lesson;
  }

  // Students need active enrollment to access contentUrl
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    // Return lesson metadata without video URL
    // 404 not 403 — avoids confirming lesson exists to non-enrolled users
    return { ...lesson, contentUrl: null };
  }

  return lesson;
}

export async function createLesson(
  moduleId: string,
  input: CreateLessonInput,
  userId: string
) {
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: input.title,
      order: input.order,
      durationSeconds: input.durationSeconds,
      contentUrl: input.contentUrl,
    },
    select: lessonSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "lesson.create",
      entityType: "Lesson",
      entityId: lesson.id,
      metadata: { moduleId, title: input.title },
    },
  });

  return lesson;
}

export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput,
  userId: string
) {
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.order !== undefined && { order: input.order }),
      ...(input.durationSeconds !== undefined && { durationSeconds: input.durationSeconds }),
      ...(input.contentUrl !== undefined && { contentUrl: input.contentUrl }),
    },
    select: lessonSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "lesson.update",
      entityType: "Lesson",
      entityId: lessonId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return lesson;
}

export async function deleteLesson(lessonId: string, userId: string): Promise<void> {
  await prisma.lesson.delete({ where: { id: lessonId } });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "lesson.delete",
      entityType: "Lesson",
      entityId: lessonId,
    },
  });
}

export async function reorderLessons(
  moduleId: string,
  input: ReorderLessonsInput,
  userId: string
): Promise<void> {
  await prisma.$transaction(
    input.lessons.map(({ id, order }) =>
      prisma.lesson.update({
        where: { id, moduleId },
        data: { order },
      })
    )
  );

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "lesson.reorder",
      entityType: "Module",
      entityId: moduleId,
    },
  });
}