import type { Request, Response, NextFunction } from "express";
import { uploadThumbnail, generateVideoUploadUrl } from "../../services/upload.service";
import { prisma } from "../../config/prisma";

export async function uploadThumbnailHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const thumbnailUrl = await uploadThumbnail(
      req.file.buffer,
      req.file.mimetype
    );

    await prisma.course.update({
      where: { id: req.params.courseId as string },
      data: { thumbnailUrl },
    });

    await prisma.auditEvent.create({
      data: {
        userId: (req as any).user?.sub,
        action: "course.thumbnail_updated",
        entityType: "Course",
        entityId: req.params.courseId as string,
      },
    });

    res.status(200).json({ thumbnailUrl });
  } catch (error) {
    next(error);
  }
}

export async function generateVideoUploadUrlHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { mimeType } = req.body;
    if (!mimeType) {
      res.status(400).json({ message: "mimeType is required" });
      return;
    }

    const { uploadUrl, filePath } = await generateVideoUploadUrl(
      req.params.courseId as string,
      req.params.lessonId as string,
      mimeType
    );

    res.status(200).json({ uploadUrl, filePath });
  } catch (error) {
    next(error);
  }
}