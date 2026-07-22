import { describe, it, expect } from "vitest";
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