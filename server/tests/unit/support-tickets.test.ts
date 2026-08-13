import { describe, it, expect, afterEach } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

describe("Support ticket notifications and closed-ticket rules", () => {
  const ticketIds: string[] = [];
  const userIds: string[] = [];

  afterEach(async () => {
    for (const ticketId of ticketIds.splice(0)) {
      await prisma.supportMessage.deleteMany({ where: { ticketId } }).catch(() => {});
      await prisma.supportTicket.delete({ where: { id: ticketId } }).catch(() => {});
    }
    for (const userId of userIds.splice(0)) {
      await prisma.notification.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.auditEvent.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.refreshToken.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
  });

  it("notifies admins when a user sends a follow-up message", async () => {
    const admin = await createTestUser({ email: "admin-ticket-msg@test.com", role: "ADMIN" });
    const instructor = await createTestUser({
      email: "instructor-ticket-msg@test.com",
      role: "INSTRUCTOR",
    });
    userIds.push(admin.user.id, instructor.user.id);

    const createRes = await request
      .post("/api/support/tickets")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ subject: "Payout issue", body: "Need help with earnings." });
    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.ticket.id as string;
    ticketIds.push(ticketId);

    await prisma.notification.deleteMany({ where: { userId: admin.user.id } });

    const replyRes = await request
      .post(`/api/support/tickets/${ticketId}/reply`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ body: "Any update on this?" });
    expect(replyRes.status).toBe(201);

    const adminNotifications = await prisma.notification.findMany({
      where: { userId: admin.user.id, type: "SUPPORT_TICKET_MESSAGE" },
    });
    expect(adminNotifications.length).toBeGreaterThan(0);
  });

  it("notifies ticket creator when admin replies and blocks user replies on closed tickets", async () => {
    const admin = await createTestUser({ email: "admin-ticket-close@test.com", role: "ADMIN" });
    const instructor = await createTestUser({
      email: "instructor-ticket-close@test.com",
      role: "INSTRUCTOR",
    });
    userIds.push(admin.user.id, instructor.user.id);

    const createRes = await request
      .post("/api/support/tickets")
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ subject: "Account access", body: "Cannot access dashboard." });
    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.ticket.id as string;
    ticketIds.push(ticketId);

    await prisma.notification.deleteMany({ where: { userId: instructor.user.id } });

    const adminReply = await request
      .post(`/api/admin/tickets/${ticketId}/reply`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ body: "We are looking into this." });
    expect(adminReply.status).toBe(201);

    const updatedNotifications = await prisma.notification.findMany({
      where: { userId: instructor.user.id, type: "SUPPORT_TICKET_UPDATED" },
    });
    expect(updatedNotifications.length).toBeGreaterThan(0);

    const closeRes = await request
      .patch(`/api/admin/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "CLOSED" });
    expect(closeRes.status).toBe(200);

    const closedNotifications = await prisma.notification.findMany({
      where: { userId: instructor.user.id, type: "SUPPORT_TICKET_CLOSED" },
    });
    expect(closedNotifications.length).toBeGreaterThan(0);

    const userReply = await request
      .post(`/api/support/tickets/${ticketId}/reply`)
      .set("Authorization", `Bearer ${instructor.accessToken}`)
      .send({ body: "One more question." });
    expect(userReply.status).toBe(403);
  });
});
