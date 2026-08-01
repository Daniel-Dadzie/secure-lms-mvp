import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mechlms.test" },
    update: {},
    create: {
      email: "admin@mechlms.test",
      passwordHash,
      fullName: "Admin User",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@mechlms.test" },
    update: {},
    create: {
      email: "instructor@mechlms.test",
      passwordHash,
      fullName: "Instructor User",
      role: "INSTRUCTOR",
      isEmailVerified: true,
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: "instructor2@mechlms.test" },
    update: {},
    create: {
      email: "instructor2@mechlms.test",
      passwordHash,
      fullName: "Instructor Two",
      role: "INSTRUCTOR",
      isEmailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@mechlms.test" },
    update: {},
    create: {
      email: "student@mechlms.test",
      passwordHash,
      fullName: "Student User",
      role: "STUDENT",
      isEmailVerified: true,
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "web-development" },
    update: {},
    create: {
      name: "Web Development",
      slug: "web-development",
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "intro-to-web-development" },
    update: {},
    create: {
      title: "Intro to Web Development",
      slug: "intro-to-web-development",
      description: "A starter course seeded for local development and testing.",
      priceCents: 0,
      status: "PUBLISHED",
      instructorId: instructor.id,
      categoryId: category.id,
    },
  });

  // Paid course — for testing checkout price/coupon logic
  const paidCourse = await prisma.course.upsert({
    where: { slug: "advanced-typescript" },
    update: {},
    create: {
      title: "Advanced TypeScript",
      slug: "advanced-typescript",
      description: "A seeded paid course for testing checkout and coupon logic.",
      priceCents: 4999, // GHS 49.99
      status: "PUBLISHED",
      instructorId: instructor2.id,
      categoryId: category.id,
    },
  });

  // ----------------------------------------------------------------------------
  // Modules + lessons for the free course.
  // Cleaned up and recreated on every seed run for idempotency — deleting the
  // module cascades to its lessons, which cascades to any lessonProgress rows
  // (see schema onDelete: Cascade), so re-running this script never leaves
  // orphaned test data behind. Real v4 UUIDs generated via uuidv4() so they
  // pass Zod's .uuid() validation in the API layer (unlike the earlier
  // hardcoded "00000000-..." placeholders, which were valid as DB values but
  // not RFC 4122-compliant UUIDs).
  // ----------------------------------------------------------------------------
  await prisma.module.deleteMany({ where: { courseId: course.id } });

  const module1 = await prisma.module.create({
    data: {
      id: uuidv4(),
      courseId: course.id,
      title: "Getting Started",
      order: 1,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      id: uuidv4(),
      moduleId: module1.id,
      title: "Welcome to the course",
      durationSeconds: 300,
      order: 1,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      id: uuidv4(),
      moduleId: module1.id,
      title: "Setting up your environment",
      durationSeconds: 600,
      order: 2,
    },
  });

  // Coupon — 20% off, for testing the discount path in checkout()
  const coupon = await prisma.coupon.upsert({
    where: { code: "TEST20" },
    update: {},
    create: {
      code: "TEST20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxUses: 100,
      isActive: true,
    },
  });

  console.log({
    admin: admin.email,
    instructor: instructor.email,
    student: student.email,
    freeCourse: course.title,
    freeCourseId: course.id,
    moduleId: module1.id,
    lessonIds: [lesson1.id, lesson2.id],
    paidCourse: paidCourse.title,
    paidCourseId: paidCourse.id,
    coupon: coupon.code,
  });
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });