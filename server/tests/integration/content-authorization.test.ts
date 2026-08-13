import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { request, createTestUser } from "../helpers/app.helper";
import { prisma } from "../../src/config/prisma";

async function createContentFixture(
  status: "PUBLISHED" | "DRAFT" = "PUBLISHED"
) {
  const { user: instructor } = await createTestUser({
    email: `content-instructor-${crypto.randomUUID()}@test.com`,
    role: "INSTRUCTOR",
  });

  const course = await prisma.course.create({
    data: {
      title: "Secure Content Test Course",
      slug: `secure-content-${crypto.randomUUID()}`,
      description: "Security test fixture",
      highlights: [],
      learningObjectives: [],
      instructorId: instructor.id,
      status,
      isActive: true,
    },
  });

  const courseModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Secure Module",
      order: 1,
    },
  });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: courseModule.id,
      title: "Protected Video Lesson",
      order: 1,
      durationSeconds: 300,
      contentUrl: "https://cdn.example.test/protected-video.mp4",
    },
  });

  return {
    course,
    courseModule,
    lesson,
  };
}

describe("Security — Course content authorization", () => {
  it("does not expose lesson contentUrl through the public modules endpoint", async () => {
    const { course } = await createContentFixture("PUBLISHED");

    const res = await request.get(
      `/api/courses/${course.id}/modules`
    );

    expect(res.status).toBe(200);
    expect(res.body.modules).toHaveLength(1);
    expect(res.body.modules[0].lessons).toHaveLength(1);
    expect(res.body.modules[0].lessons[0]).not.toHaveProperty(
      "contentUrl"
    );
  });

  it("does not expose modules belonging to a draft course", async () => {
    const { course } = await createContentFixture("DRAFT");

    const res = await request.get(
      `/api/courses/${course.id}/modules`
    );

    expect(res.status).toBe(404);
  });

  it("hides lesson contentUrl from a non-enrolled student", async () => {
    const { course, courseModule, lesson } =
      await createContentFixture("PUBLISHED");

    const { accessToken } = await createTestUser({
      email: `non-enrolled-${crypto.randomUUID()}@test.com`,
      role: "STUDENT",
    });

    const res = await request
      .get(
        `/api/courses/${course.id}/modules/${courseModule.id}/lessons/${lesson.id}`
      )
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.lesson.contentUrl).toBeNull();
  });

  it("does not expose lesson contentUrl through the public course detail endpoint", async () => {
  const { course } = await createContentFixture("PUBLISHED");

  const res = await request.get(`/api/courses/${course.id}`);

  expect(res.status).toBe(200);
  expect(res.body.course.modules).toHaveLength(1);
  expect(res.body.course.modules[0].lessons).toHaveLength(1);
  expect(res.body.course.modules[0].lessons[0]).not.toHaveProperty(
    "contentUrl"
   );

 });

  it("does not expose lesson contentUrl through the public course catalogue", async () => {
  const { course } = await createContentFixture("PUBLISHED");

  const res = await request.get("/api/courses?limit=50");

  expect(res.status).toBe(200);

  const returnedCourse = res.body.data.find(
    (item: any) => item.id === course.id
  );

  expect(returnedCourse).toBeDefined();
  expect(returnedCourse.modules).toHaveLength(1);
  expect(returnedCourse.modules[0].lessons).toHaveLength(1);
  expect(returnedCourse.modules[0].lessons[0]).not.toHaveProperty(
    "contentUrl"
   );
 });

  it("returns lesson contentUrl to an actively enrolled student", async () => {
    const { course, courseModule, lesson } =
      await createContentFixture("PUBLISHED");

    const { user: student, accessToken } = await createTestUser({
      email: `enrolled-${crypto.randomUUID()}@test.com`,
      role: "STUDENT",
    });

    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    const res = await request
      .get(
        `/api/courses/${course.id}/modules/${courseModule.id}/lessons/${lesson.id}`
      )
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.lesson.contentUrl).toBe(
      "https://cdn.example.test/protected-video.mp4"
    );
  });

  it("resolves course detail by slug and exposes access flags", async () => {
    const { course } = await createContentFixture("PUBLISHED");

    const res = await request.get(`/api/courses/${course.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.course.id).toBe(course.id);
    expect(res.body.course.access.canPlayContent).toBe(false);
    expect(res.body.course.modules[0].lessons[0]).not.toHaveProperty("contentUrl");
  });

  it("allows the owning instructor to preview a draft course with play access", async () => {
    const { user: instructor, accessToken } = await createTestUser({
      email: `draft-owner-${crypto.randomUUID()}@test.com`,
      role: "INSTRUCTOR",
    });

    const course = await prisma.course.create({
      data: {
        title: "Draft Preview Course",
        slug: `draft-preview-${crypto.randomUUID()}`,
        description: "Draft preview test",
        highlights: [],
        learningObjectives: [],
        instructorId: instructor.id,
        status: "DRAFT",
        isActive: true,
      },
    });

    const ownerRes = await request
      .get(`/api/courses/${course.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.course.access.isPreview).toBe(true);
    expect(ownerRes.body.course.access.canPlayContent).toBe(true);

    const publicRes = await request.get(`/api/courses/${course.id}`);
    expect(publicRes.status).toBe(404);
  });

  it("grants play access to enrolled students on the course detail endpoint", async () => {
    const { course } = await createContentFixture("PUBLISHED");

    const { user: student, accessToken } = await createTestUser({
      email: `detail-enrolled-${crypto.randomUUID()}@test.com`,
      role: "STUDENT",
    });

    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    const res = await request
      .get(`/api/courses/${course.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.course.access.canPlayContent).toBe(true);
    expect(res.body.course.access.isEnrolled).toBe(true);
  });
});
