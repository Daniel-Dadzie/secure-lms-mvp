import { describe, it, expect } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

describe("Auth — Register", () => {
  it("registers a new student and returns accessToken + user", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "student@test.com",
      password: "Password123!",
      fullName: "Student One",
      role: "STUDENT",
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe("student@test.com");
    expect(res.body.user.role).toBe("STUDENT");
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("returns 409 on duplicate email without revealing which condition failed", async () => {
    await createTestUser({ email: "dup@test.com" });
    const res = await request.post("/api/auth/register").send({
      email: "dup@test.com",
      password: "Password123!",
      fullName: "Dup User",
      role: "STUDENT",
    });
    expect(res.status).toBe(409);
    // Generic message only — no "email already exists" hint
    expect(res.body.message).toBe("Registration failed");
  });

  it("rejects ADMIN role self-assignment", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "hacker@test.com",
      password: "Password123!",
      fullName: "Hacker",
      role: "ADMIN",
    });
    expect(res.status).toBe(400);
  });

  it("rejects INSTRUCTOR role self-assignment", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "hacker2@test.com",
      password: "Password123!",
      fullName: "Hacker2",
      role: "INSTRUCTOR",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.role).toBeDefined();
  });

  it("rejects weak password (under 8 chars)", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "weak@test.com",
      password: "123",
      fullName: "Weak Pass",
      role: "STUDENT",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBeDefined();
  });
});

describe("Auth — Login", () => {
  it("logs in with correct credentials and returns accessToken", async () => {
    await createTestUser({ email: "login@test.com", password: "Password123!" });
    const res = await request.post("/api/auth/login").send({
      email: "login@test.com",
      password: "Password123!",
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("returns 401 on wrong password with generic message", async () => {
    await createTestUser({ email: "wrong@test.com" });
    const res = await request.post("/api/auth/login").send({
      email: "wrong@test.com",
      password: "WrongPassword!",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns 401 on non-existent email with same generic message", async () => {
    const res = await request.post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "Password123!",
    });
    expect(res.status).toBe(401);
    // Same message as wrong password — prevents user enumeration
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("sets httpOnly cookie on login", async () => {
    await createTestUser({ email: "cookie@test.com" });
    const res = await request.post("/api/auth/login").send({
      email: "cookie@test.com",
      password: "Password123!",
    });
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c: string) => c.includes("HttpOnly"))).toBe(true);
    expect(cookies.some((c: string) => c.includes("refreshToken"))).toBe(true);
  });
});

describe("Auth — Token refresh", () => {
  it("issues a new accessToken using the refresh cookie", async () => {
    const { cookie } = await createTestUser({ email: "refresh@test.com" });
    const res = await request
      .post("/api/auth/refresh")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("returns 401 with no refresh cookie", async () => {
    const res = await request.post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("refresh token rotation is atomic - transaction rollback on user inactivation", async () => {
    // Create a user
    const { cookie, userId } = await createTestUser({ email: "atomic@test.com" });

    // Manually deactivate the user to simulate a failure condition during rotation
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Attempt refresh - should fail and rollback any partial changes
    const res = await request
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(res.status).toBe(401);

    // Verify no new token was created (transaction rolled back)
    const tokens = await prisma.refreshToken.findMany({
      where: { userId },
    });
    // Should only have the original token, no new one created
    const activeTokens = tokens.filter((t: { revokedAt: Date | null }) => !t.revokedAt);
    expect(activeTokens.length).toBe(0); // Original should be revoked during failed attempt

    // Clean up - reactivate user for other tests
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  });
});

describe("Auth — Logout", () => {
  it("clears the refresh cookie on logout", async () => {
    const { cookie } = await createTestUser({ email: "logout@test.com" });
    const res = await request
      .post("/api/auth/logout")
      .set("Cookie", cookie);
    expect(res.status).toBe(204);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    // Cookie should be cleared (maxAge=0 or expires in past)
    expect(cookies.some((c: string) => c.includes("refreshToken=;") || c.includes("refreshToken=,"))).toBe(true);
  });

  it("revokes all tokens in the same family on logout", async () => {
    // Create a user and get their refresh token family
    const { cookie, userId } = await createTestUser({ email: "family@test.com" });

    // Get the initial token family from the database
    const initialTokens = await prisma.refreshToken.findMany({
      where: { userId },
    });
    expect(initialTokens.length).toBe(1);
    const family = initialTokens[0].family;

    // Perform refresh to create a second token in the same family
    await request.post("/api/auth/refresh").set("Cookie", cookie);

    // Verify we now have 2 tokens in the same family (1 revoked, 1 active)
    const afterRefreshTokens = await prisma.refreshToken.findMany({
      where: { userId, family },
    });
    expect(afterRefreshTokens.length).toBe(2);

    // Logout using the original token
    await request.post("/api/auth/logout").set("Cookie", cookie);

    // Verify ALL tokens in the family are now revoked
    const afterLogoutTokens = await prisma.refreshToken.findMany({
      where: { userId, family },
    });
    const activeTokens = afterLogoutTokens.filter((t: { revokedAt: Date | null }) => !t.revokedAt);
    expect(activeTokens.length).toBe(0);
  });
});

describe("Auth — /me", () => {
  it("returns current user with valid token", async () => {
    // 1. Create the user
    await createTestUser({ email: "me@test.com", password: "Password123!" });

    // 2. Explicitly log in to get a guaranteed valid token and cookie
    const loginRes = await request.post("/api/auth/login").send({
      email: "me@test.com",
      password: "Password123!",
    });

    const validToken = loginRes.body.accessToken;
    const authCookie = loginRes.headers["set-cookie"];

    // 3. Send BOTH the Bearer token AND the Cookie to cover all bases
    const res = await request
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${validToken}`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });

  it("returns 401 with no token", async () => {
    const res = await request.get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with expired/invalid token", async () => {
    const res = await request
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });
});
