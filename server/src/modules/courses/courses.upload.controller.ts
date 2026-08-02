import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { uploadThumbnail, generateVideoUploadUrl, deleteThumbnail } from "../../services/upload.service";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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

    // Fetch the existing thumbnail URL before overwriting, so we can clean
    // up the old Cloudinary asset after the new one is confirmed uploaded —
    // otherwise every re-upload leaves an orphaned image on Cloudinary forever.
    const existingCourse = await prisma.course.findUnique({
      where: { id: req.params.courseId as string },
      select: { thumbnailUrl: true },
    });

    const thumbnailUrl = await uploadThumbnail(
      req.file.buffer,
      req.file.mimetype
    );

    await prisma.course.update({
      where: { id: req.params.courseId as string },
      data: { thumbnailUrl },
    });

    // Delete the old thumbnail only after the new one is successfully
    // uploaded and saved — never delete first, to avoid ending up with no
    // thumbnail at all if the new upload fails partway through.
    if (existingCourse?.thumbnailUrl) {
      deleteThumbnail(existingCourse.thumbnailUrl).catch((err) =>
        console.error("Failed to delete old thumbnail:", err)
      );
    }

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