import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import express from "express";
import supertest from "supertest";
import { prisma } from "../../src/config/prisma";
import { authenticate } from "../../src/middleware/authenticate";
import { requireOwnership } from "../../src/middleware/requireOwnership";
import { createTestUser } from "../helpers/app.helper";
import { generateAccessToken, attemptIDOR, attemptUnauthorizedAccess } from "../helpers/security.helper";

describe("IDOR Prevention — requireOwnership", () => {
  let app: express.Express;
  let request: supertest.Agent;

  // DB entities IDs
  let studentA: any, studentB: any;
  let instructorA: any, instructorB: any;
  let admin: any;

  let courseA: any, courseB: any;
  let moduleA: any, moduleB: any;
  let lessonA: any, lessonB: any;
  let progressA: any, progressB: any;
  let certA: any, certB: any;

  beforeAll(async () => {
    // 1. Create a dummy Express app to mount our ownership middlewares for isolation testing
    app = express();
    app.use(express.json());

    app.get(
      "/test/lessons/:lessonProgressId",
      authenticate,
      requireOwnership("lesson"),
      (req, res) => {
        res.status(200).json({ status: "success" });
      }
    );

    app.get(
      "/test/modules/:moduleId",
      authenticate,
      requireOwnership("module"),
      (req, res) => {
        res.status(200).json({ status: "success" });
      }
    );

    app.get(
      "/test/certificates/:certificateId",
      authenticate,
      requireOwnership("certificate"),
      (req, res) => {
        res.status(200).json({ status: "success" });
      }
    );

    request = supertest(app);

  });

  beforeEach(async () => {
    // Recreate database fixtures because the global setup removes test data
    // after every individual test.
    studentA = await createTestUser({ email: "studenta-idor@test.com", role: "STUDENT" });
    studentB = await createTestUser({ email: "studentb-idor@test.com", role: "STUDENT" });
    instructorA = await createTestUser({ email: "instructora-idor@test.com", role: "INSTRUCTOR" });
    instructorB = await createTestUser({ email: "instructorb-idor@test.com", role: "INSTRUCTOR" });
    admin = await createTestUser({ email: "admin-idor@test.com", role: "ADMIN" });

    // Create courses
    courseA = await prisma.course.create({
      data: {
        title: "Course A",
        slug: "course-a",
        description: "Desc A",
        priceCents: 1000,
        status: "PUBLISHED",
        instructorId: instructorA.user.id,
      },
    });

    courseB = await prisma.course.create({
      data: {
        title: "Course B",
        slug: "course-b",
        description: "Desc B",
        priceCents: 1000,
        status: "PUBLISHED",
        instructorId: instructorB.user.id,
      },
    });

    // Create modules
    moduleA = await prisma.module.create({
      data: {
        title: "Module A",
        order: 1,
        courseId: courseA.id,
      },
    });

    moduleB = await prisma.module.create({
      data: {
        title: "Module B",
        order: 1,
        courseId: courseB.id,
      },
    });

    // Create lessons
    lessonA = await prisma.lesson.create({
      data: {
        title: "Lesson A",
        order: 1,
        moduleId: moduleA.id,
      },
    });

    lessonB = await prisma.lesson.create({
      data: {
        title: "Lesson B",
        order: 1,
        moduleId: moduleB.id,
      },
    });

    // Create enrollments
    const enrollmentA = await prisma.enrollment.create({
      data: {
        userId: studentA.user.id,
        courseId: courseA.id,
        status: "ACTIVE",
      },
    });

    const enrollmentB = await prisma.enrollment.create({
      data: {
        userId: studentB.user.id,
        courseId: courseB.id,
        status: "ACTIVE",
      },
    });

    // Create progress
    progressA = await prisma.lessonProgress.create({
      data: {
        userId: studentA.user.id,
        lessonId: lessonA.id,
        enrollmentId: enrollmentA.id,
        status: "IN_PROGRESS",
      },
    });

    progressB = await prisma.lessonProgress.create({
      data: {
        userId: studentB.user.id,
        lessonId: lessonB.id,
        enrollmentId: enrollmentB.id,
        status: "IN_PROGRESS",
      },
    });

    // Create certificates
    certA = await prisma.certificate.create({
      data: {
        userId: studentA.user.id,
        courseId: courseA.id,
      },
    });

    certB = await prisma.certificate.create({
      data: {
        userId: studentB.user.id,
        courseId: courseB.id,
      },
    });
  });

  describe("Lesson Progress Ownership IDOR Prevention", () => {
    it("allows a student to read their own lesson progress", async () => {
      const res = await request
        .get(`/test/lessons/${progressA.id}`)
        .set("Authorization", `Bearer ${studentA.accessToken}`);
      expect(res.status).toBe(200);
    });

    it("denies student B from reading student A's lesson progress (returns 404)", async () => {
      await attemptIDOR(request, `/test/lessons/${progressA.id}`, studentB.accessToken);
    });

    it("allows Admin to bypass and access student A's lesson progress", async () => {
      const res = await request
        .get(`/test/lessons/${progressA.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);
      expect(res.status).toBe(200);
    });

    it("denies unauthenticated requests", async () => {
      await attemptUnauthorizedAccess(request, `/test/lessons/${progressA.id}`);
    });
  });

  describe("Module Ownership IDOR Prevention (Instructor course check)", () => {
    it("allows instructor A to read module of course A (which they teach)", async () => {
      const res = await request
        .get(`/test/modules/${moduleA.id}`)
        .set("Authorization", `Bearer ${instructorA.accessToken}`);
      expect(res.status).toBe(200);
    });

    it("denies instructor B from reading module A (returns 404)", async () => {
      await attemptIDOR(request, `/test/modules/${moduleA.id}`, instructorB.accessToken);
    });

    it("denies student A from reading module A via instructor ownership middleware (returns 404)", async () => {
      await attemptIDOR(request, `/test/modules/${moduleA.id}`, studentA.accessToken);
    });

    it("allows Admin to bypass and access module A", async () => {
      const res = await request
        .get(`/test/modules/${moduleA.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("Certificate Ownership IDOR Prevention", () => {
    it("allows student A to read their own certificate", async () => {
      const res = await request
        .get(`/test/certificates/${certA.id}`)
        .set("Authorization", `Bearer ${studentA.accessToken}`);
      expect(res.status).toBe(200);
    });

    it("denies student B from reading student A's certificate (returns 404)", async () => {
      await attemptIDOR(request, `/test/certificates/${certA.id}`, studentB.accessToken);
    });

    it("allows Admin to bypass and access student A's certificate", async () => {
      const res = await request
        .get(`/test/certificates/${certA.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`);
      expect(res.status).toBe(200);
    });
  });
});
