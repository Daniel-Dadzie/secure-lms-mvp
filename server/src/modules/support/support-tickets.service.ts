import { prisma } from "../../config/prisma";
import * as ticketsService from "../admin/admin-tickets.service";
import {
  isTicketClosedForUser,
  notifyAllAdmins,
} from "./support-ticket-notifications";

export async function createUserTicket(data: {
  userId: string;
  subject: string;
  body: string;
}) {
  return ticketsService.createTicket(data);
}

export async function listUserTickets(userId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return tickets;
}

export async function getUserTicket(ticketId: string, userId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
        },
      },
    },
  });

  if (!ticket || ticket.userId !== userId) {
    const error = new Error("Ticket not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return ticket;
}

export async function replyToUserTicket(ticketId: string, userId: string, body: string) {
  const ticket = await getUserTicket(ticketId, userId);

  if (isTicketClosedForUser(ticket.status)) {
    const error = new Error(
      "This ticket is closed. You cannot reply unless an admin reopens it."
    );
    (error as any).statusCode = 403;
    throw error;
  }

  const message = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: userId,
      body,
      isStaff: false,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "OPEN", updatedAt: new Date() },
  });

  await notifyAllAdmins(
    "SUPPORT_TICKET_MESSAGE",
    "New ticket message",
    `New message on ticket "${ticket.subject}".`,
    { ticketId, userId }
  );

  return message;
}
