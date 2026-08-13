import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function getStudentDashboardData(userId: string) {
  // 1. Fetch active enrollments with modules, lessons, and progress records
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    include: {
      course: {
        include: {
          instructor: true,
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
      progress: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const activeEnrollments = enrollments.filter((e) => e.status !== "COMPLETED");
  const completedCoursesCount = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;

  const activeCoursesCount = activeEnrollments.length;

  const progressMapByEnrollment = new Map(
    enrollments.map((e) => [
      e.id,
      new Map(e.progress.map((p) => [p.lessonId, p.status])),
    ])
  );

  // 2. Calculate dynamic progress and format active (in-progress) courses
  const activeCourses = activeEnrollments
    .map((enrollment) => {
      const progressMap = progressMapByEnrollment.get(enrollment.id)!;
      const sortedModules = [...enrollment.course.modules].sort(
        (a, b) => a.order - b.order
      );

      const allLessons = sortedModules.flatMap((m) =>
        [...m.lessons].sort((a, b) => a.order - b.order)
      );
      const totalLessons = allLessons.length;

      const completedLessonsCount = allLessons.filter(
        (lesson) => progressMap.get(lesson.id) === "COMPLETED"
      ).length;

      const currentProgress =
        totalLessons > 0
          ? Math.round((completedLessonsCount / totalLessons) * 100)
          : 0;

      const nextIncomplete = allLessons.find(
        (lesson) => progressMap.get(lesson.id) !== "COMPLETED"
      );

      const remainingSeconds = allLessons
        .filter((lesson) => progressMap.get(lesson.id) !== "COMPLETED")
        .reduce((sum, lesson) => sum + (lesson.durationSeconds ?? 0), 0);

      const remainingHours = Math.ceil(remainingSeconds / 3600);

      const lastActivity = enrollment.progress.reduce((latest, p) => {
        const ts = p.updatedAt.getTime();
        return ts > latest ? ts : latest;
      }, 0);

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        progress: currentProgress,
        instructorName: enrollment.course.instructor?.fullName || "Instructor",
        timeRemaining:
          remainingHours > 0
            ? `${remainingHours}h left`
            : enrollment.course.duration || "Almost done",
        nextLesson: nextIncomplete?.title || "Continue learning",
        lastActivity,
      };
    })
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .map(({ lastActivity: _lastActivity, ...course }) => course);

  // Calculate average progress across active courses for stats
  const avgProgressVal = activeCoursesCount > 0 
    ? Math.round(activeCourses.reduce((acc, c) => acc + c.progress, 0) / activeCoursesCount)
    : 0;

  // 3. Fetch Recommended Courses (Excluding already enrolled courses)
  const recommendedCoursesData = await prisma.course.findMany({
    where: {
      NOT: {
        enrollments: {
          some: { userId: userId }
        }
      }
    },
    take: 3,
    orderBy: { averageRating: 'desc' },
    include: { instructor: true }
  });

  const recommendedCourses = recommendedCoursesData.map(c => ({
    id: c.id,
    title: c.title,
    thumbnailUrl: c.thumbnailUrl,
    instructorName: c.instructor?.fullName || "Expert Instructor",
    rating: c.averageRating || 4.8,
    reviewsCount: c.reviewCount || 0,
    duration: c.duration || "35h",
    price: c.priceCents ? c.priceCents / 100 : null
  }));

  // 4. Fetch Recent Activities Feed (Wrapped in a try/catch or checked if Activity table exists)
  let activities: any[];
  try {
    activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        iconType: true,
        createdAt: true,
      }
    });
  } catch (err) {
    // Fallback if activity table migration hasn't populated yet
    activities = [];
  }

  const [lessonsDone, certificatesCount, timeAgg] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.certificate.count({ where: { userId } }),
    prisma.lessonProgress.aggregate({
      where: { userId },
      _sum: { progressSeconds: true },
    }),
  ]);

  const totalSeconds = timeAgg._sum.progressSeconds ?? 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const timeInvested =
    hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : "0m";

  return {
    stats: {
      avgProgress: `${avgProgressVal}%`,
      lessonsDone,
      certificates: certificatesCount,
      completedCoursesCount,
      timeInvested,
      activeCoursesCount,
    },
    activeCourses,
    recommendedCourses,
    activities,
    weeklyGoal: {
      completed: 5,
      total: 7,
      percentage: 71
    }
  };
}