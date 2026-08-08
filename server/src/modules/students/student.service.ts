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

  // Format active courses optimized for quick-resume action
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

  // Fetch recommended catalog courses (Discovery)
  const allCourses = await prisma.course.findMany({ take: 3, include: { instructor: true } });
  const recommendedCourses = allCourses.map(c => ({
    id: c.id,
    title: c.title,
    instructor: c.instructor?.fullName || "Expert Instructor",
    rating: 4.8,
    duration: c.duration || "35h",
    level: c.level || "Intermediate",
    thumbnailUrl: c.thumbnailUrl
  }));

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
    weeklyGoal: {
      completed: 5,
      total: 7,
      percentage: 71
    }
  };
}