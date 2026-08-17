import { prisma } from '../../config/prisma';

// Helper function to create URL-friendly slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Helper function to get avatar URL with fallback
function getAvatarUrl(avatarUrl: string | null): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  // Return a default avatar placeholder
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';
}

export async function getAllInstructors() {
  const instructors = await prisma.user.findMany({
    where: {
      role: 'INSTRUCTOR',
      isActive: true,
      coursesTaught: {
        some: {
          status: 'PUBLISHED',
          isActive: true
        }
      }
    },
    select: {
      id: true,
      fullName: true,
      specialization: true,
      credentials: true,
      avatarUrl: true,
      experienceYears: true,
      instructorCategory: true,
      coursesTaught: {
        where: { status: 'PUBLISHED', isActive: true },
        select: {
          _count: {
            select: { enrollments: true }
          },
          averageRating: true
        }
      }
    }
  });

  // Transform data to match frontend structure
  return instructors.map(instructor => {
    const courses = instructor.coursesTaught;
    const totalCourses = courses.length;
    let totalStudents = 0;
    let totalRatingSum = 0;

    courses.forEach(course => {
      totalStudents += course._count.enrollments;
      totalRatingSum += course.averageRating;
    });

    const avgRating = totalCourses > 0 ? (totalRatingSum / totalCourses).toFixed(1) : "0.0";
    const slug = createSlug(instructor.fullName);

    return {
      id: instructor.id,
      slug: slug,
      fullName: instructor.fullName,
      specialization: instructor.specialization,
      credentials: instructor.credentials,
      avatarUrl: getAvatarUrl(instructor.avatarUrl),
      rating: parseFloat(avgRating),
      studentsCount: totalStudents.toLocaleString(),
      coursesCount: totalCourses,
      experienceYears: instructor.experienceYears || "0 yrs",
      category: instructor.instructorCategory || "General"
    };
  });
}

export async function getPopularInstructors(limit: number = 4) {
  const instructors = await prisma.user.findMany({
    where: {
      role: 'INSTRUCTOR',
      isActive: true
    },
    select: {
      id: true,
      fullName: true,
      specialization: true,
      credentials: true,
      avatarUrl: true,
      experienceYears: true,
      instructorCategory: true,
      coursesTaught: {
        where: { status: 'PUBLISHED', isActive: true },
        select: {
          _count: {
            select: { enrollments: true }
          },
          averageRating: true
        }
      }
    }
  });

  // Transform data and calculate ratings
  const instructorsWithRatings = instructors.map(instructor => {
    const courses = instructor.coursesTaught;
    const totalCourses = courses.length;
    let totalStudents = 0;
    let totalRatingSum = 0;

    courses.forEach(course => {
      totalStudents += course._count.enrollments;
      totalRatingSum += course.averageRating;
    });

    const avgRating = totalCourses > 0 ? (totalRatingSum / totalCourses).toFixed(1) : "0.0";
    const slug = createSlug(instructor.fullName);

    return {
      id: instructor.id,
      slug: slug,
      fullName: instructor.fullName,
      specialization: instructor.specialization,
      credentials: instructor.credentials,
      avatarUrl: getAvatarUrl(instructor.avatarUrl),
      rating: parseFloat(avgRating),
      studentsCount: totalStudents.toLocaleString(),
      coursesCount: totalCourses,
      experienceYears: instructor.experienceYears || "0 yrs",
      category: instructor.instructorCategory || "General"
    };
  });

  // Sort by rating (descending) and take top N
  return instructorsWithRatings
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getInstructorProfile(identifier: string) {
  // First try to find by ID (exact match)
  let instructor = await prisma.user.findFirst({
    where: {
      role: 'INSTRUCTOR',
      isActive: true,
      id: identifier
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

  // If not found by ID, try to find by slug matching
  if (!instructor) {
    // Get all instructors and check if any have a matching slug
    const allInstructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        isActive: true
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

    // Find the instructor whose name's slug matches the identifier
    instructor = allInstructors.find(inst => createSlug(inst.fullName) === identifier) || null;
  }

  // Additional fallback: try name-based matching
  if (!instructor) {
    const formattedName = identifier.includes("-")
      ? identifier.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      : identifier;

    instructor = await prisma.user.findFirst({
      where: {
        role: 'INSTRUCTOR',
        isActive: true,
        OR: [
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
  }

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
  const slug = createSlug(instructor.fullName);
  return {
    id: instructor.id,
    slug: slug,
    fullName: instructor.fullName,
    specialization: instructor.specialization,
    credentials: instructor.credentials,
    shortBio: instructor.shortBio,
    bio: instructor.bio,
    avatarUrl: getAvatarUrl(instructor.avatarUrl),
    expertise: instructor.expertise || [],
    stats: {
      rating: avgRating,
      students: totalStudents.toLocaleString(),
      courses: totalCourses,
      experience: instructor.experienceYears || "0 yrs",
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
