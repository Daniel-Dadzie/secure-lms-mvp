import { describe, it, expect, vi } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";

describe("RBAC — Role enforcement", () => {
  it("denies student access to admin user list", async () => {
    const { accessToken } = await createTestUser({
      email: "student-rbac@test.com",
      role: "STUDENT",
    });
    const res = await request
      .get("/api/users/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it("denies instructor access to admin user list", async () => {
    const { accessToken } = await createTestUser({
      email: "instructor-rbac@test.com",
      role: "INSTRUCTOR",
    });
    const res = await request
      .get("/api/users/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it("allows admin access to admin user list", async () => {
    const { accessToken } = await createTestUser({
      email: "admin-rbac@test.com",
      role: "ADMIN",
    });
    const res = await request
      .get("/api/users/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  it("denies unauthenticated access to protected route", async () => {
    const res = await request.get("/api/users/profile");
    expect(res.status).toBe(401);
  });

  it("denies student from deactivating a user", async () => {
    const { accessToken } = await createTestUser({
      email: "student-deact@test.com",
      role: "STUDENT",
    });
    const res = await request
      .post("/api/users/admin/users/some-user-id/deactivate")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });
});

describe("RBAC — Deny by default", () => {
  it("returns 401 on unknown protected route with no token", async () => {
    const res = await request.get("/api/users/admin/users");
    expect(res.status).toBe(401);
  });

  it("never returns 200 on admin route for non-admin roles", async () => {
    const roles = ["STUDENT", "INSTRUCTOR"] as const;
    for (const role of roles) {
      const { accessToken } = await createTestUser({
        email: `deny-${role.toLowerCase()}@test.com`,
        role,
      });
      const res = await request
        .get("/api/users/admin/users")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).not.toBe(200);
    }
  });
});

describe("RBAC — Missing and Invalid Token Variations", () => {
  it("denies access with missing auth header", async () => {
    const res = await request.get("/api/users/profile");
    expect(res.status).toBe(401);
  });

  it("denies access with non-bearer auth header", async () => {
    const res = await request
      .get("/api/users/profile")
      .set("Authorization", "Basic dXNlcjpwYXNz");
    expect(res.status).toBe(401);
  });

  it("denies access with malformed bearer token", async () => {
    const res = await request
      .get("/api/users/profile")
      .set("Authorization", "Bearer not-a-valid-jwt-token-string");
    expect(res.status).toBe(401);
  });

  it("denies access with expired bearer token", async () => {
    const { generateExpiredAccessToken } = await import("../helpers/security.helper");
    const { user } = await createTestUser({ email: "expired-tok@test.com" });
    const expiredToken = generateExpiredAccessToken(user.id, "STUDENT");

    const res = await request
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it("denies access with token signed with wrong secret", async () => {
    const { generateTokenWithWrongSecret } = await import("../helpers/security.helper");
    const { user } = await createTestUser({ email: "wrong-sec@test.com" });
    const wrongSecretToken = generateTokenWithWrongSecret(user.id, "STUDENT");

    const res = await request
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${wrongSecretToken}`);
    expect(res.status).toBe(401);
  });
});

describe("RBAC — Role Escalation Restrictions", () => {
  it("prevents student from accessing instructor routes (conceptually, or any admin routes)", async () => {
    const { accessToken } = await createTestUser({
      email: "stud-esc@test.com",
      role: "STUDENT",
    });
    // Attempting to access admin dashboard
    const res = await request
      .get("/api/users/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });
});

describe("RBAC — Security Observability & Immutability", () => {
  it("emits a structured stdout JSON log on 403, but does NOT write to AuditEvent table", async () => {
    const { accessToken } = await createTestUser({
      email: "log-test@test.com",
      role: "STUDENT",
    });

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request
      .get("/api/users/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(403);

    // Verify stdout log was called
    expect(spy).toHaveBeenCalled();
    const logString = spy.mock.calls[0][0];
    const logObj = JSON.parse(logString);
    expect(logObj).toHaveProperty("level", "warn");
    expect(logObj).toHaveProperty("event", "auth.permission_denied");
    expect(logObj).toHaveProperty("userId");
    expect(logObj).toHaveProperty("role", "STUDENT");
    expect(logObj).toHaveProperty("requiredRoles");
    expect(logObj.requiredRoles).toContain("ADMIN");

    // Verify NO DB AuditEvent record was created
    const { prisma } = await import("../../src/config/prisma");
    const events = await prisma.auditEvent.findMany({
      where: { action: "auth.permission_denied" },
    });
    expect(events.length).toBe(0);

    spy.mockRestore();
  });
});