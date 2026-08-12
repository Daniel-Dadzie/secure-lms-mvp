import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Define explicit types for search results
interface CourseResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status?: string;
}

interface StudentResult {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

interface ModuleResult {
  id: string;
  title: string;
  courseId?: string;
}

interface VideoResult {
  id: string;
  title: string;
  durationSeconds?: number | null;
}

interface SearchResults {
  courses: CourseResult[];
  students: StudentResult[];
  modules: ModuleResult[];
  videos: VideoResult[];
}

export async function handleGlobalSearch(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query || query.length === 0) {
      res.status(400).json({ error: "Search query 'q' is required." });
      return;
    }

    const searchPattern = { contains: query, mode: "insensitive" as const };
    
    const results: SearchResults = {
      courses: [],
      students: [],
      modules: [],
      videos: [],
    };

    if (user.role === "STUDENT") {
      results.courses = await prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ title: searchPattern }, { description: searchPattern }],
        },
        select: { id: true, title: true, description: true, thumbnailUrl: true },
        take: 10,
      });
    } else if (user.role === "INSTRUCTOR") {
      results.courses = await prisma.course.findMany({
        where: {
          instructorId: user.id,
          OR: [{ title: searchPattern }, { description: searchPattern }],
        },
        select: { id: true, title: true, description: true, thumbnailUrl: true },
        take: 10,
      });

      results.modules = await prisma.module.findMany({
        where: {
          course: { instructorId: user.id },
          title: searchPattern,
        },
        select: { id: true, title: true, courseId: true },
        take: 10,
      });

      results.videos = await prisma.lesson.findMany({
        where: {
          module: { course: { instructorId: user.id } },
          title: searchPattern,
        },
        select: { id: true, title: true, durationSeconds: true },
        take: 10,
      });

      results.students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          OR: [{ fullName: searchPattern }, { email: searchPattern }],
        },
        select: { id: true, fullName: true, email: true },
        take: 10,
      });
    } else if (user.role === "ADMIN") {
      results.courses = await prisma.course.findMany({
        where: { OR: [{ title: searchPattern }, { description: searchPattern }] },
        select: { id: true, title: true, description: true, status: true, thumbnailUrl: true },
        take: 10,
      });

      results.students = await prisma.user.findMany({
        where: {
          OR: [{ fullName: searchPattern }, { email: searchPattern }],
        },
        select: { id: true, fullName: true, email: true, role: true },
        take: 10,
      });

      results.modules = await prisma.module.findMany({
        where: { title: searchPattern },
        select: { id: true, title: true },
        take: 10,
      });

      results.videos = await prisma.lesson.findMany({
        where: { title: searchPattern },
        select: { id: true, title: true, durationSeconds: true },
        take: 10,
      });
    }

    res.status(200).json({ query, results });
  } catch (error) {
    console.error("Global search execution failed:", error);
    res.status(500).json({ error: "Internal server error during search." });
  }
}