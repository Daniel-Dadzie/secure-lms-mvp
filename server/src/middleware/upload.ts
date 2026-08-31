import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

export const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Invalid file type. Only JPG, PNG and WebP allowed.");
      (error as any).statusCode = 400;
      cb(error);
    }
  },
});

export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Invalid file type. Only MP4, MOV, WebM and MKV allowed.");
      (error as any).statusCode = 400;
      cb(error);
    }
  },
});