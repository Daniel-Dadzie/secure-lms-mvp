import { prisma } from "../../config/prisma";

export async function getEnrollments(filters: {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: string;
  userId?: string;
}) {
  const { page = 1, limit = 20, status, courseId, userId } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as any }),
    ...(courseId && { courseId }),
    ...(userId && { userId }),
  };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.enrollment.count({ where }),
  ]);

  return { enrollments, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function manualEnroll(
  userId: string,
  courseId: string,
  adminId: string
) {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!user || !course) {
    const error = new Error("User or course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    const error = new Error("User already enrolled");
    (error as any).statusCode = 409;
    throw error;
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId, status: "ACTIVE" },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.enrollment_created",
      entityType: "Enrollment",
      entityId: enrollment.id,
      metadata: { userId, courseId },
    },
  });

  return enrollment;
}

export async function cancelEnrollment(enrollmentId: string, adminId: string) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) {
    const error = new Error("Enrollment not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "CANCELLED" },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.enrollment_cancelled",
      entityType: "Enrollment",
      entityId: enrollmentId,
    },
  });
}
