import { prisma } from "../../config/prisma";
import type { NotificationType } from "@prisma/client";

// ----------------------------------------------------------------------------
// Internal helper — called from other services (payments, enrolments,
// progress, reviews) at the exact moment a real event happens. Never called
// directly from a route/controller.
// ----------------------------------------------------------------------------
import type { Prisma } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, message, metadata },
  });
}

// ----------------------------------------------------------------------------
// Get paginated notifications for the current user, newest first.
// ----------------------------------------------------------------------------
export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ----------------------------------------------------------------------------
// Mark a single notification as read — ownership enforced (404, not 403,
// matching the rest of the codebase's info-disclosure-avoidance pattern).
// ----------------------------------------------------------------------------
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== userId) {
    const error = new Error("Notification not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

// ----------------------------------------------------------------------------
// Mark all of the current user's notifications as read.
// ----------------------------------------------------------------------------
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}