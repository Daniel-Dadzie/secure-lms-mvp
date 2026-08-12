import { prisma } from "../../config/prisma";

type SupportMetadata = {
  question?: string;
  confidence?: number;
  answered?: boolean;
  resolution?: string;
};

function isUnresolved(metadata: unknown): boolean {
  const m = metadata as SupportMetadata | null;
  if (!m) return true;
  return m.answered !== true;
}

export async function getSupportMessages(filters: {
  answered?: boolean;
  page?: number;
  limit?: number;
}) {
  const { answered, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const events = await prisma.auditEvent.findMany({
    where: { action: "support.question_asked" },
    include: {
      user: { select: { id: true, fullName: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const filtered =
    answered === undefined
      ? events
      : events.filter((e) =>
          answered ? !isUnresolved(e.metadata) : isUnresolved(e.metadata)
        );

  const resolvedIds = new Set(
    (
      await prisma.auditEvent.findMany({
        where: { action: "support.question_resolved" },
        select: { entityId: true },
      })
    )
      .map((e) => e.entityId)
      .filter(Boolean)
  );

  const withResolved = filtered.map((e) => ({
    ...e,
    resolved: resolvedIds.has(e.id) || !isUnresolved(e.metadata),
  }));

  const finalList =
    answered === undefined
      ? withResolved
      : withResolved.filter((e) => (answered ? e.resolved : !e.resolved));

  const total = finalList.length;
  const paged = finalList.slice(skip, skip + limit);

  return {
    messages: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSupportUnreadCount(): Promise<number> {
  const { total } = await getSupportMessages({ answered: false, page: 1, limit: 1 });
  return total;
}

export async function resolveSupportMessage(
  eventId: string,
  adminId: string,
  note?: string
): Promise<void> {
  const event = await prisma.auditEvent.findUnique({ where: { id: eventId } });
  if (!event || event.action !== "support.question_asked") {
    const error = new Error("Support message not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "support.question_resolved",
      entityType: "AuditEvent",
      entityId: eventId,
      metadata: {
        resolution: note ?? "Resolved by admin",
        question:
          typeof (event.metadata as Record<string, unknown> | null)?.question === "string"
            ? (event.metadata as Record<string, unknown>).question
            : undefined,
      },
    },
  });
}
