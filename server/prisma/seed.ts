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

  console.log({ admin: admin.email, instructor: instructor.email, student: student.email, course: course.title });
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