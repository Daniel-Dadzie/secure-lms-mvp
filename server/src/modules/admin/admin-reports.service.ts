import { prisma } from "../../config/prisma";

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  return lines.join("\n");
}

export async function exportUsersCsv(): Promise<string> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });
  return toCsv(
    ["Name", "Email", "Role", "Active", "EmailVerified", "CreatedAt"],
    users.map((u) => [
      u.fullName,
      u.email,
      u.role,
      u.isActive,
      u.isEmailVerified,
      u.createdAt.toISOString(),
    ])
  );
}

export async function exportCoursesCsv(): Promise<string> {
  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = await Promise.all(
    courses.map(async (c) => {
      const rev = await prisma.purchase.aggregate({
        where: { courseId: c.id, status: "COMPLETED" },
        _sum: { finalAmountCents: true },
      });
      return [
        c.title,
        c.instructor.fullName,
        c.status,
        c._count.enrollments,
        (rev._sum.finalAmountCents ?? 0) / 100,
        c.createdAt.toISOString(),
      ];
    })
  );

  return toCsv(
    ["Title", "Instructor", "Status", "Enrollments", "Revenue", "CreatedAt"],
    rows
  );
}

export async function exportPurchasesCsv(from?: Date, to?: Date): Promise<string> {
  const purchases = await prisma.purchase.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
    },
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Buyer", "Email", "Course", "AmountCents", "FinalAmountCents", "Status", "Date"],
    purchases.map((p) => [
      p.user.fullName,
      p.user.email,
      p.course.title,
      p.amountCents,
      p.finalAmountCents,
      p.status,
      p.createdAt.toISOString(),
    ])
  );
}

export async function exportEnrollmentsCsv(): Promise<string> {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return toCsv(
    ["Student", "Email", "Course", "Status", "EnrolledAt"],
    enrollments.map((e) => [
      e.user.fullName,
      e.user.email,
      e.course.title,
      e.status,
      e.enrolledAt.toISOString(),
    ])
  );
}

export async function exportAuditLogCsv(from?: Date, to?: Date): Promise<string> {
  const events = await prisma.auditEvent.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
    },
    include: {
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  return toCsv(
    ["Timestamp", "User", "Email", "Action", "EntityType", "EntityId", "IP"],
    events.map((e) => [
      e.createdAt.toISOString(),
      e.user?.fullName ?? "System",
      e.user?.email ?? "",
      e.action,
      e.entityType ?? "",
      e.entityId ?? "",
      e.ipAddress ?? "",
    ])
  );
}

export async function getReportsSummary() {
  const [users, courses, purchases, enrollments, auditEvents] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.purchase.count(),
    prisma.enrollment.count(),
    prisma.auditEvent.count(),
  ]);
  return {
    users,
    courses,
    purchases,
    enrollments,
    auditEvents,
  };
}
