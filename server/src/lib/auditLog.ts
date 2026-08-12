import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function logAuditEvent(data: {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditEvent.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ?? undefined,
    },
  });
}
