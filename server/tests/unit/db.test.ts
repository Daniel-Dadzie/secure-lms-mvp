import { describe, it, expect } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

describe("DB constraints", () => {
  it("prevents duplicate email registration at DB level", async () => {
    await createTestUser({ email: "unique@test.com" });
    await expect(
      prisma.user.create({
        data: {
          email: "unique@test.com",
          passwordHash: "hash",
          fullName: "Dup",
          role: "STUDENT",
        },
      })
    ).rejects.toThrow();
  });

  it("prevents duplicate enrollment at DB level", async () => {
    const { user } = await createTestUser({ email: "enroll@test.com" });
    const instructor = await prisma.user.create({
      data: {
        email: "instructor-db@test.com",
        passwordHash: "hash",
        fullName: "Instructor",
        role: "INSTRUCTOR",
      },
    });
    const course = await prisma.course.create({
      data: {
        title: "Test Course",
        slug: "test-course-db",
        description: "Test",
        priceCents: 0,
        status: "PUBLISHED",
        instructorId: instructor.id,
      },
    });

    await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id },
    });

    // Second enrollment for same user+course should fail
    await expect(
      prisma.enrollment.create({
        data: { userId: user.id, courseId: course.id },
      })
    ).rejects.toThrow();
  });

  it("passwordHash is never returned in API responses", async () => {
    const { user } = await createTestUser({ email: "hash@test.com" });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("audit events are written on register", async () => {
    const { user } = await createTestUser({ email: "audit@test.com" });
    const events = await prisma.auditEvent.findMany({
      where: { userId: user.id, action: "auth.register" },
    });
    expect(events.length).toBeGreaterThan(0);
  });

  it("audit events are written on login", async () => {
    await createTestUser({ email: "auditlogin@test.com" });
    await request.post("/api/auth/login").send({
      email: "auditlogin@test.com",
      password: "Password123!",
    });
    const { prisma: db } = await import("../../src/config/prisma");
    const events = await db.auditEvent.findMany({
      where: { action: "auth.login_success" },
    });
    expect(events.length).toBeGreaterThan(0);
  });
});