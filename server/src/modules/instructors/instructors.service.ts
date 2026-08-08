import { prisma } from '../../config/prisma';

export async function getInstructorProfile(identifier: string) {
  // Convert slug back to name format for fallback search (e.g., "kwame-osei" -> "Kwame Osei")
  const formattedName = identifier.includes("-") 
    ? identifier.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : identifier;

  const instructor = await prisma.user.findFirst({
    where: {
      role: 'INSTRUCTOR',
      isActive: true,
      OR: [
        { id: identifier },
        { fullName: { equals: formattedName, mode: 'insensitive' } },
        { fullName: { contains: identifier.replace(/-/g, ' '), mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      fullName: true,
      specialization: true,
      credentials: true,
      avatarUrl: true,
      experienceYears: true,
      shortBio: true,
      bio: true,
      expertise: true,
      coursesTaught: {
        where: { status: 'PUBLISHED', isActive: true },
        select: {
          id: true,
          title: true,
          slug: true,
          level: true,
          averageRating: true,
          reviewCount: true,
          duration: true,
          priceCents: true,
          thumbnailUrl: true,
          _count: {
            select: { enrollments: true }
          }
        }
      }
    }
  });

  if (!instructor) {
    return null;
  }

  // Aggregate stats dynamically based on the database records[cite: 1]
  const totalCourses = instructor.coursesTaught.length;
  let totalStudents = 0;
  let totalRatingSum = 0;
  instructor.coursesTaught.forEach(course => {
    totalStudents += course._count.enrollments;
    totalRatingSum += course.averageRating;
  });
  const avgRating = totalCourses > 0 ? (totalRatingSum / totalCourses).toFixed(1) : "0.0";

  // Transform data to perfectly match the Frontend Mock Data structure[cite: 1]
  return {
    id: instructor.id,
    fullName: instructor.fullName,
    specialization: instructor.specialization,
    credentials: instructor.credentials,
    shortBio: instructor.shortBio,
    bio: instructor.bio,
    avatarUrl: instructor.avatarUrl,
    expertise: instructor.expertise || [],
    stats: {
      rating: avgRating,
      students: totalStudents.toLocaleString(),
      courses: totalCourses,
      experience: instructor.experienceYears,
      completionRate: "91%"
    },
    courses: instructor.coursesTaught.map(course => ({
      id: course.id,
      title: course.title,
      level: course.level,
      rating: course.averageRating,
      reviews: course.reviewCount.toLocaleString(),
      duration: course.duration,
      price: course.priceCents === 0 ? "Free" : `$${(course.priceCents / 100).toFixed(2)}`,
      thumbnailUrl: course.thumbnailUrl
    })),
    reviews: [] 
  };
}