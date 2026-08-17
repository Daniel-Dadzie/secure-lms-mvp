import slugify from "slugify";
import { prisma } from "../../config/prisma";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CourseFilters,
  PaginatedCourses,
  CourseResponse,
  CourseDetailResponse,
} from "./courses.types";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const courseSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  thumbnailUrl: true,
  priceCents: true,
  status: true,
  learningObjectives: true,
  instructorId: true,
  instructor: {
    select: { id: true, fullName: true, email: true },
  },
  categoryId: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          title: true,
          contentUrl: true,
          durationSeconds: true,
          order: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

// ----------------------------------------------------------------------------
// Public course selector
// Lesson metadata may be shown publicly, but protected lesson content URLs
// must never be returned through catalogue or public course-detail endpoints.
// Full lesson content is retrieved through the authenticated lesson endpoint.
// ----------------------------------------------------------------------------
const publicCourseSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  longDescription: true,
  duration: true,
  level: true,
  highlights: true,
  learningObjectives: true,
  thumbnailUrl: true,
  priceCents: true,
  status: true,
  averageRating: true,
  reviewCount: true,
  instructorId: true,
  instructor: {
    select: { id: true, fullName: true, email: true },
  },
  categoryId: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          title: true,
          durationSeconds: true,
          order: true,
        },
      },
    },
  },
  _count: {
    select: { enrollments: true },
  },
  createdAt: true,
  updatedAt: true,
} as const;

type CourseViewer = { sub: string; role: string } | null | undefined;

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// ----------------------------------------------------------------------------
// Public catalogue — published courses only
// Security: unpublished/archived courses never appear here regardless of ID
// ----------------------------------------------------------------------------
export async function getPublishedCourses(filters: CourseFilters): Promise<PaginatedCourses> {
  const { search, categoryId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      select: publicCourseSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    data: courses as CourseResponse[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ----------------------------------------------------------------------------
// Single course detail — published courses are public; draft/archived visible
// only to the owning instructor or an admin. Supports lookup by id or slug.
// Returns lesson titles only (no contentUrl). Access flags indicate who can play.
// ----------------------------------------------------------------------------
export async function getCourseDetail(
  idOrSlug: string,
  viewer?: CourseViewer
): Promise<CourseDetailResponse> {
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      ...publicCourseSelect,
      isActive: true,
    },
  });

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const userId = viewer?.sub;
  const userRole = viewer?.role;
  const isAdmin = userRole === "ADMIN";
  const isOwner = !!userId && userId === course.instructorId;
  const isPubliclyVisible = course.status === "PUBLISHED" && course.isActive;

  if (!isPubliclyVisible && !isAdmin && !isOwner) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  let isEnrolled = false;
  let enrollmentId: string | undefined;

  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
      select: { id: true, status: true },
    });

    if (
      enrollment &&
      (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED")
    ) {
      isEnrolled = true;
      enrollmentId = enrollment.id;
    }
  }

  const canPlayContent = isAdmin || isOwner || isEnrolled;
  const { _count, isActive: _isActive, ...courseData } = course;

  return {
    ...(courseData as CourseResponse),
    enrollmentCount: _count.enrollments,
    access: {
      canPlayContent,
      isEnrolled,
      isOwner,
      isAdmin,
      isPreview: !isPubliclyVisible,
    },
    enrollmentId,
  } as CourseDetailResponse;
}

/** @deprecated Use getCourseDetail — kept for internal callers */
export async function getPublishedCourseById(courseId: string): Promise<CourseResponse> {
  const detail = await getCourseDetail(courseId);
  return detail;
}

// ----------------------------------------------------------------------------
// Instructor: create course
// ----------------------------------------------------------------------------
export async function createCourse(
  instructorId: string,
  input: CreateCourseInput
): Promise<CourseResponse> {
  // Check for duplicate title + category combination
  const existingCourse = await prisma.course.findFirst({
    where: {
      title: input.title,
      categoryId: input.categoryId,
      isActive: true,
    },
  });

  if (existingCourse) {
    const error = new Error("A course with this title already exists in this category. Please choose a different title or category.");
    (error as any).statusCode = 409;
    throw error;
  }

  const slug = await generateUniqueSlug(input.title);

  const course = await prisma.course.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      priceCents: input.priceCents,
      thumbnailUrl: input.thumbnailUrl,
      categoryId: input.categoryId,
      instructorId,
      status: "DRAFT",
    },
    select: courseSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId: instructorId,
      action: "course.create",
      entityType: "Course",
      entityId: course.id,
      metadata: { title: course.title, slug: course.slug },
    },
  });

  return course as CourseResponse;
}

// ----------------------------------------------------------------------------
// Instructor: update course (owner or admin only — enforced by middleware)
// ----------------------------------------------------------------------------
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
  userId: string
): Promise<CourseResponse> {
  // Check for duplicate title + category combination (excluding current course)
  if (input.title && input.categoryId) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        title: input.title,
        categoryId: input.categoryId,
        isActive: true,
        id: { not: courseId },
      },
    });

    if (existingCourse) {
      const error = new Error("A course with this title already exists in this category. Please choose a different title or category.");
      (error as any).statusCode = 409;
      throw error;
    }
  }

  const slug = input.title
    ? await generateUniqueSlug(input.title, courseId)
    : undefined;

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(input.title && { title: input.title, slug }),
      ...(input.description && { description: input.description }),
      ...(input.priceCents !== undefined && { priceCents: input.priceCents }),
      ...(input.thumbnailUrl && { thumbnailUrl: input.thumbnailUrl }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.status && { status: input.status }),
      ...(input.learningObjectives !== undefined && { learningObjectives: input.learningObjectives }),
    },
    select: courseSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "course.update",
      entityType: "Course",
      entityId: courseId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return course as CourseResponse;
}

// ----------------------------------------------------------------------------
// Instructor: publish course
// ----------------------------------------------------------------------------
export async function publishCourse(
  courseId: string,
  userId: string
): Promise<CourseResponse> {
  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
    select: courseSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "course.publish",
      entityType: "Course",
      entityId: courseId,
    },
  });

  return course as CourseResponse;
}

// ----------------------------------------------------------------------------
// Instructor: unpublish course (back to draft)
// ----------------------------------------------------------------------------
export async function unpublishCourse(
  courseId: string,
  userId: string
): Promise<CourseResponse> {
  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "DRAFT" },
    select: courseSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "course.unpublish",
      entityType: "Course",
      entityId: courseId,
    },
  });

  return course as CourseResponse;
}

// ----------------------------------------------------------------------------
// Admin: archive course (soft delete)
// ----------------------------------------------------------------------------
export async function archiveCourse(
  courseId: string,
  adminId: string
): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED", isActive: false },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.course_archived",
      entityType: "Course",
      entityId: courseId,
      metadata: course ? { courseTitle: course.title } : undefined,
    },
  });
}

// ----------------------------------------------------------------------------
// Instructor: get own courses (all statuses)
// ----------------------------------------------------------------------------
export async function getInstructorCourses(
  instructorId: string
): Promise<CourseResponse[]> {
  const courses = await prisma.course.findMany({
    where: { instructorId, isActive: true },
    select: {
      ...courseSelect,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return courses as CourseResponse[];
}

// ----------------------------------------------------------------------------
// Admin: get all courses (all statuses)
// ----------------------------------------------------------------------------
export async function getAllCourses(): Promise<CourseResponse[]> {
  const courses = await prisma.course.findMany({
    select: courseSelect,
    orderBy: { createdAt: "desc" },
  });

  return courses as CourseResponse[];
}
