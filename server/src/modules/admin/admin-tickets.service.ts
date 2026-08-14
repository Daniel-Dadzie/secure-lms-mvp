import { prisma } from "../../config/prisma";
import type { TicketPriority, TicketStatus } from "@prisma/client";
import {
  isTicketClosedForUser,
  notifyAllAdmins,
  notifyTicketCreator,
} from "../support/support-ticket-notifications";

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

  await notifyAllAdmins(
    "SUPPORT_TICKET_NEW",
    "New support ticket",
    data.subject,
    { ticketId: ticket.id }
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
  const ticket = await getTicketById(ticketId);

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

  await notifyTicketCreator(
    ticket.userId,
    "SUPPORT_TICKET_UPDATED",
    "Support ticket updated",
    `An admin replied to your ticket "${ticket.subject}".`,
    { ticketId, status: "IN_PROGRESS" }
  );

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

  if (adminId && data.status && data.status !== existing.status) {
    if (data.status === "RESOLVED" || data.status === "CLOSED") {
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

      await notifyTicketCreator(
        existing.userId,
        "SUPPORT_TICKET_CLOSED",
        "Support ticket closed",
        `Your ticket "${existing.subject}" has been marked as ${data.status.toLowerCase()}. You can no longer reply unless an admin reopens it.`,
        { ticketId, status: data.status }
      );
    } else if (
      isTicketClosedForUser(existing.status) &&
      (data.status === "OPEN" || data.status === "IN_PROGRESS")
    ) {
      await notifyTicketCreator(
        existing.userId,
        "SUPPORT_TICKET_UPDATED",
        "Support ticket reopened",
        `Your ticket "${existing.subject}" has been reopened. You can reply again.`,
        { ticketId, status: data.status }
      );
    } else {
      await notifyTicketCreator(
        existing.userId,
        "SUPPORT_TICKET_UPDATED",
        "Support ticket updated",
        `The status of your ticket "${existing.subject}" is now ${data.status.replace("_", " ").toLowerCase()}.`,
        { ticketId, status: data.status }
      );
    }
  }

  return ticket;
}

export async function getOpenTicketCount(): Promise<number> {
  return prisma.supportTicket.count({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
  });
}
