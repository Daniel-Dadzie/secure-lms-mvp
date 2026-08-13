import { describe, it, expect } from "vitest";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

describe("Instructor portal RBAC", () => {
  it("denies student access to instructor students list", async () => {
    const { accessToken } = await createTestUser({
      email: "student-portal@test.com",
      role: "STUDENT",
    });
    const res = await request
      .get("/api/instructor/students")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it("allows instructor access to own students list", async () => {
    const { accessToken } = await createTestUser({
      email: "instructor-portal@test.com",
      role: "INSTRUCTOR",
    });
    const res = await request
      .get("/api/instructor/students")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("students");
  });

  it("returns 404 when instructor replies to another instructor's review", async () => {
    const instructorA = await createTestUser({
      email: "instructor-a-portal@test.com",
      role: "INSTRUCTOR",
    });
    const instructorB = await createTestUser({
      email: "instructor-b-portal@test.com",
      role: "INSTRUCTOR",
    });
    const student = await createTestUser({
      email: "student-review-portal@test.com",
      role: "STUDENT",
    });

    const course = await prisma.course.create({
      data: {
        title: "Portal RBAC Course",
        slug: `portal-rbac-${Date.now()}`,
        description: "Test course for instructor portal RBAC",
        priceCents: 0,
        status: "PUBLISHED",
        instructorId: instructorA.user.id,
      },
    });

    const review = await prisma.review.create({
      data: {
        userId: student.user.id,
        courseId: course.id,
        rating: 5,
        comment: "Great course",
      },
    });

    const res = await request
      .patch(`/api/instructor/reviews/${review.id}/reply`)
      .set("Authorization", `Bearer ${instructorB.accessToken}`)
      .send({ reply: "Thanks!" });

    expect(res.status).toBe(404);

    await prisma.review.delete({ where: { id: review.id } });
    await prisma.course.delete({ where: { id: course.id } });
  });
});
