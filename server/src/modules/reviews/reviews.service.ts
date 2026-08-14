import { prisma } from "../../config/prisma";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.schemas";
import { createNotification } from "../notifications/notifications.service";


const reviewSelect = {
  id: true,
  userId: true,
  courseId: true,
  rating: true,
  comment: true,
  instructorReply: true,
  instructorReplyAt: true,
  isVisible: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, fullName: true },
  },
} as const;

// ----------------------------------------------------------------------------
// Recompute and persist rating aggregates atomically.
// Called after any review create, update, or visibility change.
// Uses a transaction so aggregate never drifts from actual reviews.
// ----------------------------------------------------------------------------
async function updateRatingAggregate(courseId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { courseId, isVisible: true },
    select: { rating: true },
  });

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

  const distribution = { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 };
  reviews.forEach(({ rating }) => {
    if (rating === 1) distribution.oneStar++;
    else if (rating === 2) distribution.twoStar++;
    else if (rating === 3) distribution.threeStar++;
    else if (rating === 4) distribution.fourStar++;
    else if (rating === 5) distribution.fiveStar++;
  });

  await prisma.$transaction([
    prisma.course.update({
      where: { id: courseId },
      data: { averageRating: average, reviewCount: total },
    }),
    prisma.ratingAggregate.upsert({
      where: { courseId },
      update: { ...distribution },
      create: { courseId, ...distribution },
    }),
  ]);
}

// ----------------------------------------------------------------------------
// Get paginated reviews for a course (visible only for public listings)
// ----------------------------------------------------------------------------
async function resolveViewableCourse(
  idOrSlug: string,
  viewer?: { sub: string; role: string } | null
) {
  const course = await prisma.course.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, status: true, isActive: true, instructorId: true },
  });

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const isAdmin = viewer?.role === "ADMIN";
  const isOwner = !!viewer?.sub && viewer.sub === course.instructorId;
  const isPubliclyVisible = course.status === "PUBLISHED" && course.isActive;

  if (!isPubliclyVisible && !isAdmin && !isOwner) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return course;
}

export async function getCourseReviews(
  courseIdOrSlug: string,
  page: number = 1,
  limit: number = 10,
  viewer?: { sub: string; role: string } | null
) {
  const course = await resolveViewableCourse(courseIdOrSlug, viewer);
  const skip = (page - 1) * limit;

  const [reviews, total, aggregate, courseRatings, myReview] = await Promise.all([
    prisma.review.findMany({
      where: { courseId: course.id, isVisible: true },
      select: reviewSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { courseId: course.id, isVisible: true } }),
    prisma.ratingAggregate.findUnique({ where: { courseId: course.id } }),
    prisma.course.findUnique({
      where: { id: course.id },
      select: { averageRating: true, reviewCount: true },
    }),
    viewer?.sub
      ? prisma.review.findUnique({
          where: { userId_courseId: { userId: viewer.sub, courseId: course.id } },
          select: reviewSelect,
        })
      : Promise.resolve(null),
  ]);

  return {
    reviews,
    myReview,
    averageRating: courseRatings?.averageRating || 0,
    totalReviews: total,
    distribution: aggregate || {
      oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0,
    },
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ----------------------------------------------------------------------------
// Create review — student must be enrolled and not have reviewed before
// ----------------------------------------------------------------------------
export async function createReview(
  courseId: string,
  userId: string,
  input: CreateReviewInput
) {
  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status === "CANCELLED") {
    const error = new Error("You must be enrolled in this course to leave a review");
    (error as any).statusCode = 403;
    throw error;
  }

 // Check for existing review
  const existing = await prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    const error = new Error("You have already reviewed this course");
    (error as any).statusCode = 409;
    throw error;
  }

  // The existing check above has a TOCTOU race window — same pattern as
  // cart/categories. The DB's @@unique([userId, courseId]) constraint is the
  // real guarantee; this catch converts a low-level violation into the same
  // clean 409 instead of an unhandled 500.
  let review;
  try {
    review = await prisma.review.create({
      data: { userId, courseId, rating: input.rating, comment: input.comment },
      select: reviewSelect,
    });

    await updateRatingAggregate(courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  });

  if (course) {
    await createNotification(
      course.instructorId,
      "NEW_REVIEW",
      "New review received",
      `Your course "${course.title}" received a new ${input.rating}-star review.`,
      { courseId, reviewId: review.id }
    );
  }

  } catch (err: any) {
    if (err.code === "P2002") {
      const error = new Error("You have already reviewed this course");
      (error as any).statusCode = 409;
      throw error;
    }
    throw err;
  }

  // Update aggregates immediately after creation
  await updateRatingAggregate(courseId);

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "review.create",
      entityType: "Review",
      entityId: review.id,
      metadata: { courseId, rating: input.rating },
    },
  });

  return review;
}

// ----------------------------------------------------------------------------
// Update own review
// ----------------------------------------------------------------------------
export async function updateReview(
  reviewId: string,
  userId: string,
  input: UpdateReviewInput
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    const error = new Error("Review not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (review.userId !== userId) {
    const error = new Error("Review not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.comment !== undefined && { comment: input.comment }),
    },
    select: reviewSelect,
  });

  await updateRatingAggregate(review.courseId);

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "review.update",
      entityType: "Review",
      entityId: reviewId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return updated;
}

// ----------------------------------------------------------------------------
// Admin: hide review (soft delete)
// ----------------------------------------------------------------------------
export async function hideReview(
  reviewId: string,
  adminId: string
): Promise<void> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    const error = new Error("Review not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { isVisible: false },
  });

  await updateRatingAggregate(review.courseId);

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.review_hidden",
      entityType: "Review",
      entityId: reviewId,
      metadata: { courseId: review.courseId },
    },
  });
}

// ----------------------------------------------------------------------------
// Admin: restore hidden review
// ----------------------------------------------------------------------------
export async function restoreReview(
  reviewId: string,
  adminId: string
): Promise<void> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    const error = new Error("Review not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { isVisible: true },
  });

  await updateRatingAggregate(review.courseId);

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.review_restored",
      entityType: "Review",
      entityId: reviewId,
    },
  });
}