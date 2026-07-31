import { describe, it, expect } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

describe("Security — HTTP hardening", () => {
  it("sets security headers via Helmet", async () => {
    const res = await request.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });

  it("rejects oversized JSON payloads with 413", async () => {
    const largeBody = { data: "x".repeat(11 * 1024) };
    const res = await request.post("/api/auth/login").send(largeBody);
    expect(res.status).toBe(413);
  });
});

describe("Security — Audit log immutability", () => {
  it("does not expose audit event modification endpoints", async () => {
    const { accessToken } = await createTestUser({ email: "audit-immut@test.com" });

    const fakeId = "00000000-0000-0000-0000-000000000001";
    const attempts = [
      request.patch(`/api/audit/events/${fakeId}`).set("Authorization", `Bearer ${accessToken}`),
      request.delete(`/api/audit/events/${fakeId}`).set("Authorization", `Bearer ${accessToken}`),
      request.get("/api/audit/events").set("Authorization", `Bearer ${accessToken}`),
    ];

    for (const attempt of attempts) {
      const res = await attempt;
      expect([404, 401, 403]).toContain(res.status);
    }
  });

  it("creates audit events for admin activation and deactivation", async () => {
    const { accessToken: adminToken } = await createTestUser({
      email: "admin-audit@test.com",
      role: "ADMIN",
    });
    const { user } = await createTestUser({ email: "target-audit@test.com" });

    await request
      .post(`/api/users/admin/users/${user.id}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    let events = await prisma.auditEvent.findMany({
      where: { action: "admin.user_deactivated", entityId: user.id },
    });
    expect(events.length).toBe(1);

    await request
      .post(`/api/users/admin/users/${user.id}/activate`)
      .set("Authorization", `Bearer ${adminToken}`);

    events = await prisma.auditEvent.findMany({
      where: { action: "admin.user_activated", entityId: user.id },
    });
    expect(events.length).toBe(1);
  });
});
