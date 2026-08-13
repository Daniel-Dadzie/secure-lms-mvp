import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";
import type { NotificationType, Prisma } from "@prisma/client";

export async function notifyAllAdmins(
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) => createNotification(admin.id, type, title, message, metadata))
  );
}

export async function notifyTicketCreator(
  userId: string | null | undefined,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  if (!userId) return;
  await createNotification(userId, type, title, message, metadata);
}

export function isTicketClosedForUser(status: string): boolean {
  return status === "CLOSED" || status === "RESOLVED";
}
