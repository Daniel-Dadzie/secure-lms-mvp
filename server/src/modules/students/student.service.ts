import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function getStudentDashboardData(userId: string) {
  // 1. Fetch active enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: true,
          modules: true,
        }
      }
    }
  });

  const activeCoursesCount = enrollments.length;
  const avgProgress = activeCoursesCount > 0 ? 68 : 0; 

  // 2. Format active courses optimized for quick-resume action
  const activeCourses = enrollments.map((enrollment, index) => {
    const mockProgressValues = [68, 34, 91];
    const currentProgress = mockProgressValues[index % mockProgressValues.length];

    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      thumbnailUrl: enrollment.course.thumbnailUrl,
      progress: currentProgress,
      instructorName: enrollment.course.instructor?.fullName || "Instructor",
      timeRemaining: enrollment.course.duration || "2h left", 
      nextLesson: "Continue next module"
    };
  });

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

  // 4. Fetch Recent Activities Feed
  const activities = await prisma.activity.findMany({
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

  return {
    stats: {
      avgProgress: `${avgProgress}%`,
      lessonsDone: 124, 
      certificates: 2,  
      timeInvested: "47h",
      activeCoursesCount,
    },
    activeCourses,
    recommendedCourses,
    activities, // Added to the returned payload
    weeklyGoal: {
      completed: 5,
      total: 7,
      percentage: 71
    }
  };
}