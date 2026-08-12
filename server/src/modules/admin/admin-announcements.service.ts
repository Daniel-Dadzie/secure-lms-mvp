import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";
import type { Role } from "@prisma/client";

export async function broadcastAnnouncement(data: {
  title: string;
  message: string;
  targetRole?: Role;
  adminId: string;
}) {
  const where = data.targetRole ? { role: data.targetRole, isActive: true } : { isActive: true };

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  await Promise.all(
    users.map((u) =>
      createNotification(u.id, "PLATFORM_ALERT", data.title, data.message, {
        broadcastBy: data.adminId,
      })
    )
  );

  await prisma.auditEvent.create({
    data: {
      userId: data.adminId,
      action: "admin.announcement_sent",
      metadata: {
        title: data.title,
        targetRole: data.targetRole ?? "ALL",
        recipientCount: users.length,
      },
    },
  });

  return { recipientCount: users.length };
}

export async function getAnnouncementHistory(limit = 20) {
  return prisma.auditEvent.findMany({
    where: { action: "admin.announcement_sent" },
    include: {
      user: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
