import { prisma } from "../../config/prisma";
import type { CreateModuleInput, UpdateModuleInput, ReorderModulesInput } from "./modules.schemas";

const moduleSelect = {
  id: true,
  courseId: true,
  title: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  lessons: {
    select: {
      id: true,
      title: true,
      order: true,
      durationSeconds: true,
      contentUrl: true,
    },
    orderBy: { order: "asc" as const },
  },
} as const;

const publicModuleSelect = {
  id: true,
  courseId: true,
  title: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  lessons: {
    select: {
      id: true,
      title: true,
      order: true,
      durationSeconds: true,
    },
    orderBy: { order: "asc" as const },
  },
} as const;

export async function getModulesByCourse(courseId: string) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseId }, { slug: courseId }],
      status: "PUBLISHED",
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return prisma.module.findMany({
    where: {
      courseId: course.id,
    },
    select: publicModuleSelect,
    orderBy: {
      order: "asc",
    },
  });
}

export async function createModule(courseId: string, input: CreateModuleInput, userId: string) {
  const module = await prisma.module.create({
    data: { courseId, title: input.title, order: input.order },
    select: moduleSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "module.create",
      entityType: "Module",
      entityId: module.id,
      metadata: { courseId, title: input.title },
    },
  });

  return module;
}

export async function updateModule(
  moduleId: string,
  input: UpdateModuleInput,
  userId: string
) {
  const module = await prisma.module.update({
    where: { id: moduleId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.order && { order: input.order }),
    },
    select: moduleSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "module.update",
      entityType: "Module",
      entityId: moduleId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return module;
}

export async function deleteModule(moduleId: string, userId: string): Promise<void> {
  // Cascade in schema handles lesson deletion automatically
  await prisma.module.delete({ where: { id: moduleId } });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "module.delete",
      entityType: "Module",
      entityId: moduleId,
    },
  });
}

export async function reorderModules(
  courseId: string,
  input: ReorderModulesInput,
  userId: string
): Promise<void> {
  // Update all module orders in a transaction — atomic, all or nothing
  await prisma.$transaction(
    input.modules.map(({ id, order }) =>
      prisma.module.update({
        where: { id, courseId },
        data: { order },
      })
    )
  );

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "module.reorder",
      entityType: "Course",
      entityId: courseId,
    },
  });
}
