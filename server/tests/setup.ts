import { beforeAll, afterAll, afterEach } from "vitest";
import { prisma } from "../src/config/prisma";

const databaseUrl = process.env.DATABASE_URL;

if (process.env.NODE_ENV !== "test") {
  throw new Error(
    "Unsafe test configuration: NODE_ENV must be set to test."
  );
}

if (!databaseUrl) {
  throw new Error(
    "Unsafe test configuration: DATABASE_URL is not configured."
  );
}

let databaseName: string;

try {
  const parsedDatabaseUrl = new URL(databaseUrl);

  if (
    parsedDatabaseUrl.protocol !== "postgres:" &&
    parsedDatabaseUrl.protocol !== "postgresql:"
  ) {
    throw new Error("Unsupported database protocol");
  }

  databaseName = decodeURIComponent(
    parsedDatabaseUrl.pathname.replace(/^\/+/, "")
  );
} catch {
  throw new Error(
    "Unsafe test configuration: DATABASE_URL is invalid."
  );
}

if (!/(^|[_-])test$/i.test(databaseName)) {
  throw new Error(
    "Unsafe test configuration: refusing to run destructive tests against a non-test database."
  );
}

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