import { prisma } from "../../config/prisma";

// ----------------------------------------------------------------------------
// Platform statistics for admin dashboard
// ----------------------------------------------------------------------------
export async function getPlatformStats() {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalPurchases,
    totalRevenueCents,
    recentAuditEvents,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "INSTRUCTOR", isActive: true } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.course.count({ where: { status: "PUBLISHED", isActive: true } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amountCents: true },
    }),
    prisma.auditEvent.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    }),
  ]);

  return {
    users: { total: totalUsers, students: totalStudents, instructors: totalInstructors },
    courses: { total: totalCourses, published: publishedCourses },
    enrollments: { total: totalEnrollments },
    revenue: {
      totalPurchases,
      totalRevenueCents: totalRevenueCents._sum.amountCents || 0,
    },
    recentActivity: recentAuditEvents,
  };
}

// ----------------------------------------------------------------------------
// Audit log with filtering
// ----------------------------------------------------------------------------
export async function getAuditLog(filters: {
  action?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  const { action, userId, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(action && { action: { contains: action } }),
    ...(userId && { userId }),
  };

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ----------------------------------------------------------------------------
// Admin: get all courses with full details
// ----------------------------------------------------------------------------
export async function getAllCoursesAdmin() {
  return prisma.course.findMany({
    include: {
      instructor: { select: { id: true, fullName: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ----------------------------------------------------------------------------
// Admin: get all users with full details
// ----------------------------------------------------------------------------
export async function getAllUsersAdmin() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          coursesTaught: true,
          purchases: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ----------------------------------------------------------------------------
// Admin: verify user email manually
// ----------------------------------------------------------------------------
export async function verifyUserEmail(
  targetUserId: string,
  adminId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: targetUserId },
    data: { isEmailVerified: true },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.email_verified",
      entityType: "User",
      entityId: targetUserId,
    },
  });
}