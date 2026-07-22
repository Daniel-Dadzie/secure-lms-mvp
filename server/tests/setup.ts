import { beforeAll, afterAll, afterEach } from "vitest";
import { prisma } from "../src/config/prisma";

beforeAll(async () => {
  // Confirm test DB is reachable before any test runs
  await prisma.$queryRaw`SELECT 1`;
});

afterEach(async () => {
  // Clean up test data after each test in reverse FK order
  await prisma.auditEvent.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});