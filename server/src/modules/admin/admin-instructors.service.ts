import { prisma } from "../../config/prisma";

export async function getInstructors(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [instructors, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "INSTRUCTOR", isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        specialization: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { coursesTaught: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: "INSTRUCTOR", isActive: true } }),
  ]);

  const withStats = await Promise.all(
    instructors.map(async (inst) => {
      const courses = await prisma.course.findMany({
        where: { instructorId: inst.id },
        select: { id: true },
      });
      const courseIds = courses.map((c) => c.id);
      const [enrollments, completions, revenue] = await Promise.all([
        courseIds.length
          ? prisma.enrollment.count({ where: { courseId: { in: courseIds } } })
          : 0,
        courseIds.length
          ? prisma.enrollment.count({
              where: { courseId: { in: courseIds }, status: "COMPLETED" },
            })
          : 0,
        courseIds.length
          ? prisma.purchase.aggregate({
              where: { courseId: { in: courseIds }, status: "COMPLETED" },
              _sum: { finalAmountCents: true },
            })
          : { _sum: { finalAmountCents: 0 } },
      ]);
      const completionRate =
        enrollments > 0 ? Math.round((completions / enrollments) * 1000) / 10 : 0;
      return {
        ...inst,
        stats: {
          courses: inst._count.coursesTaught,
          enrollments,
          completions,
          completionRate,
          revenueCents: revenue._sum.finalAmountCents ?? 0,
        },
      };
    })
  );

  return { instructors: withStats, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getInstructorDetail(instructorId: string) {
  const instructor = await prisma.user.findFirst({
    where: { id: instructorId, role: "INSTRUCTOR" },
    select: {
      id: true,
      email: true,
      fullName: true,
      specialization: true,
      credentials: true,
      avatarUrl: true,
      bio: true,
      shortBio: true,
      expertise: true,
      createdAt: true,
      coursesTaught: {
        select: {
          id: true,
          title: true,
          status: true,
          priceCents: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (!instructor) {
    const error = new Error("Instructor not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const courseIds = instructor.coursesTaught.map((c) => c.id);
  const revenue = courseIds.length
    ? await prisma.purchase.aggregate({
        where: { courseId: { in: courseIds }, status: "COMPLETED" },
        _sum: { finalAmountCents: true },
      })
    : { _sum: { finalAmountCents: 0 } };

  return {
    ...instructor,
    stats: {
      courses: instructor.coursesTaught.length,
      enrollments: instructor.coursesTaught.reduce((s, c) => s + c._count.enrollments, 0),
      revenueCents: revenue._sum.finalAmountCents ?? 0,
    },
  };
}
