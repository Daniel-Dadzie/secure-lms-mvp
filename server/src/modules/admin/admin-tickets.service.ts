import { prisma } from "../../config/prisma";
import { createNotification } from "../notifications/notifications.service";
import type { TicketPriority, TicketStatus } from "@prisma/client";

export async function createTicket(data: {
  userId?: string;
  subject: string;
  body: string;
}) {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: data.userId ?? null,
      subject: data.subject,
      messages: {
        create: {
          senderId: data.userId ?? null,
          body: data.body,
          isStaff: false,
        },
      },
    },
    include: {
      messages: true,
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification(
        admin.id,
        "SUPPORT_TICKET_NEW",
        "New support ticket",
        data.subject,
        { ticketId: ticket.id }
      )
    )
  );

  return ticket;
}

export async function getTickets(filters: {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}) {
  const { status, priority, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTicketById(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
        },
      },
    },
  });

  if (!ticket) {
    const error = new Error("Ticket not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return ticket;
}

export async function replyToTicket(
  ticketId: string,
  adminId: string,
  body: string
) {
  await getTicketById(ticketId);

  const message = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: adminId,
      body,
      isStaff: true,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "IN_PROGRESS", updatedAt: new Date() },
  });

  return message;
}

export async function updateTicket(
  ticketId: string,
  data: { status?: TicketStatus; priority?: TicketPriority },
  adminId?: string
) {
  const existing = await getTicketById(ticketId);
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
  });

  if (
    adminId &&
    data.status &&
    data.status !== existing.status &&
    (data.status === "RESOLVED" || data.status === "CLOSED")
  ) {
    await prisma.auditEvent.create({
      data: {
        userId: adminId,
        action:
          data.status === "RESOLVED" ? "admin.ticket_resolved" : "admin.ticket_closed",
        entityType: "SupportTicket",
        entityId: ticketId,
        metadata: { subject: existing.subject, status: data.status },
      },
    });
  }

  return ticket;
}

export async function getOpenTicketCount(): Promise<number> {
  return prisma.supportTicket.count({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
  });
}
