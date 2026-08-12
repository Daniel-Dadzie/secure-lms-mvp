import { prisma } from "../../config/prisma";

const reviewSelect = {
  id: true,
  userId: true,
  courseId: true,
  rating: true,
  comment: true,
  isVisible: true,
  createdAt: true,
  user: { select: { id: true, fullName: true, email: true } },
  course: { select: { id: true, title: true } },
} as const;

export async function getAdminReviews(filters: {
  page?: number;
  limit?: number;
  visible?: boolean;
  courseId?: string;
}) {
  const { page = 1, limit = 20, visible, courseId } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(visible !== undefined && { isVisible: visible }),
    ...(courseId && { courseId }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: reviewSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function hideReviewAdmin(reviewId: string, adminId: string) {
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

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.review_hidden",
      entityType: "Review",
      entityId: reviewId,
    },
  });

  const reviews = await prisma.review.findMany({
    where: { courseId: review.courseId, isVisible: true },
    select: { rating: true },
  });
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  await prisma.course.update({
    where: { id: review.courseId },
    data: { averageRating: average, reviewCount: total },
  });
}

export async function restoreReviewAdmin(reviewId: string, adminId: string) {
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

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.review_restored",
      entityType: "Review",
      entityId: reviewId,
    },
  });

  const reviews = await prisma.review.findMany({
    where: { courseId: review.courseId, isVisible: true },
    select: { rating: true },
  });
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  await prisma.course.update({
    where: { id: review.courseId },
    data: { averageRating: average, reviewCount: total },
  });
}
