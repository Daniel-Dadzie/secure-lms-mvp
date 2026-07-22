import { app } from "../../src/app";
import supertest from "supertest";

// Single supertest instance shared across all test files
export const request = supertest(app);

// Helper: register and return tokens + user
export async function createTestUser(overrides?: {
  email?: string;
  password?: string;
  fullName?: string;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}) {
  const payload = {
    email: overrides?.email || "test@example.com",
    password: overrides?.password || "Password123!",
    fullName: overrides?.fullName || "Test User",
    role: overrides?.role || "STUDENT",
  };

  // ADMIN can't self-register — create via Prisma directly
  if (payload.role === "ADMIN") {
    const bcrypt = await import("bcryptjs");
    const { prisma } = await import("../../src/config/prisma");
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash: await bcrypt.hash(payload.password, 12),
        fullName: payload.fullName,
        role: "ADMIN",
      },
    });
    // Login to get tokens
    const res = await request
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    return { user, accessToken: res.body.accessToken, cookie: res.headers["set-cookie"] };
  }

const res = await request.post("/api/auth/register").send(payload);
  
  // Fail loudly and print the exact reason if creation fails!
  if (res.status !== 201) {
    throw new Error(`createTestUser failed! Status: ${res.status}. Response: ${JSON.stringify(res.body)}`);
  }

  return {
    user: res.body.user,
    accessToken: res.body.accessToken,
    cookie: res.headers["set-cookie"],
  };
}