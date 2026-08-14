import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { Readable } from "stream";
import { JWT_CONFIG } from "../../config/jwt";
import { firebaseStorage } from "../../config/firebase";
import { prisma } from "../../config/prisma";

const STREAM_TOKEN_EXPIRY = "2h";

interface StreamTokenPayload {
  sub: string;
  lessonId: string;
  courseId: string;
  purpose: "lesson-stream";
}

function getApiPublicBase(): string {
  if (process.env.API_PUBLIC_URL) {
    return process.env.API_PUBLIC_URL.replace(/\/$/, "");
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  return clientUrl.replace(":3000", ":4000").replace(/\/$/, "") + "/api";
}

export function createLessonStreamToken(
  userId: string,
  lessonId: string,
  courseId: string
): string {
  return jwt.sign(
    {
      sub: userId,
      lessonId,
      courseId,
      purpose: "lesson-stream",
    } satisfies StreamTokenPayload,
    JWT_CONFIG.accessSecret,
    {
      expiresIn: STREAM_TOKEN_EXPIRY,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }
  );
}

export function verifyLessonStreamToken(token: string): StreamTokenPayload {
  const payload = jwt.verify(token, JWT_CONFIG.accessSecret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  }) as StreamTokenPayload;

  if (payload.purpose !== "lesson-stream") {
    throw new Error("Invalid stream token");
  }

  return payload;
}

export function buildLessonStreamUrl(
  courseId: string,
  moduleId: string,
  lessonId: string,
  userId: string
): string {
  const token = createLessonStreamToken(userId, lessonId, courseId);
  return `${getApiPublicBase()}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/stream?token=${encodeURIComponent(token)}`;
}

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export async function getLessonRawContentUrl(
  lessonId: string,
  userId: string,
  userRole: string
): Promise<string | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      contentUrl: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: { instructorId: true },
          },
        },
      },
    },
  });

  if (!lesson?.contentUrl) {
    return null;
  }

  const courseId = lesson.module.courseId;
  const isInstructor = lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "ADMIN";

  if (isInstructor || isAdmin) {
    return lesson.contentUrl;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { status: true },
  });

  const canAccessContent =
    enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";

  return canAccessContent ? lesson.contentUrl : null;
}

async function pipeFirebaseVideo(
  filePath: string,
  req: Request,
  res: Response
): Promise<void> {
  const bucket = firebaseStorage.bucket();
  const file = bucket.file(filePath);
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size ?? 0);
  const contentType = metadata.contentType || "video/mp4";
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : size - 1;

    if (Number.isNaN(start) || start >= size || end >= size) {
      res.status(416).setHeader("Content-Range", `bytes */${size}`).end();
      return;
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });
    file.createReadStream({ start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Length": size,
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
  });
  file.createReadStream().pipe(res);
}

async function pipeExternalVideo(
  url: string,
  req: Request,
  res: Response
): Promise<void> {
  const headers: Record<string, string> = {};
  if (req.headers.range) {
    headers.Range = req.headers.range;
  }

  const upstream = await fetch(url, { headers });

  if (!upstream.ok && upstream.status !== 206) {
    res.status(upstream.status).end();
    return;
  }

  for (const header of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(header);
    if (value) {
      res.setHeader(header, value);
    }
  }

  res.status(upstream.status);

  if (!upstream.body) {
    res.end();
    return;
  }

  // Cast through unknown/any to satisfy TypeScript's Web/Node stream type incompatibility
  const nodeStream = Readable.fromWeb(upstream.body as unknown as any);
  nodeStream.pipe(res as any);
}

export async function streamLessonVideo(
  lessonId: string,
  userId: string,
  userRole: string,
  req: Request,
  res: Response
): Promise<void> {
  const rawContentUrl = await getLessonRawContentUrl(lessonId, userId, userRole);

  if (!rawContentUrl) {
    res.status(403).json({ message: "Video not available" });
    return;
  }

  if (isExternalUrl(rawContentUrl)) {
    await pipeExternalVideo(rawContentUrl, req, res);
    return;
  }

  await pipeFirebaseVideo(rawContentUrl, req, res);
}
