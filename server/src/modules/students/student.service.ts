import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function getStudentDashboardData(userId: string) {
  // 1. Fetch active enrollments with modules, lessons, and progress records
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
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
      progress: true, // Include lesson progress records for this enrollment
    },
  });

  const activeCoursesCount = enrollments.length;

  // 2. Calculate dynamic progress and format active courses
  const activeCourses = enrollments.map((enrollment) => {
    // Flatten all lessons across all modules in this course
    const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;

    // Count how many lessons have status 'COMPLETED' for this student/enrollment
    const completedLessonsCount = allLessons.filter((lesson) => {
      const lessonProg = enrollment.progress.find(
        (p) => p.lessonId === lesson.id && p.status === "COMPLETED"
      );
      return !!lessonProg;
    }).length;

    // Calculate percentage safely
    const currentProgress = totalLessons > 0 
      ? Math.round((completedLessonsCount / totalLessons) * 100) 
      : 0;

    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      thumbnailUrl: enrollment.course.thumbnailUrl,
      progress: currentProgress, // Now completely dynamic!
      instructorName: enrollment.course.instructor?.fullName || "Instructor",
      timeRemaining: enrollment.course.duration || "2h left", 
      nextLesson: "Continue next module"
    };
  });

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
      take: 4,
      select: {
        id: true,
        title: true,
        iconType: true,
        createdAt: true,
      }
    });
  } catch (err) {
    // Fallback if activity table migration hasn't populated yet
    activities = [];
  }

  return {
    stats: {
      avgProgress: `${avgProgressVal}%`,
      lessonsDone: 124, 
      certificates: 2,  
      timeInvested: "47h",
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