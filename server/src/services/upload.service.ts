import { cloudinary } from "../config/cloudinary";
import { firebaseStorage } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------------------------------------------
// Cloudinary — thumbnail uploads
// Images are uploaded server-side via buffer.
// Returns the secure CDN URL.
// Max size: 5MB. Allowed formats: jpg, png, webp.
// ----------------------------------------------------------------------------
export async function uploadThumbnail(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(mimeType)) {
    const error = new Error("Invalid file type. Only JPG, PNG and WebP allowed.");
    (error as any).statusCode = 400;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "secure-lms/thumbnails",
        resource_type: "image",
        transformation: [
          { width: 1280, height: 720, crop: "fill" }, // enforce 16:9
          { quality: "auto", fetch_format: "auto" },   // auto-optimize
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

// ----------------------------------------------------------------------------
// Firebase Storage — signed upload URL for lesson videos.
// The client uploads directly to Firebase using this URL.
// We never receive the video bytes on our server — only the final URL.
// Max size enforced by Firebase Storage rules (set in Firebase console).
// Allowed formats: mp4, mov, webm.
// ----------------------------------------------------------------------------
export async function generateVideoUploadUrl(
  courseId: string,
  lessonId: string,
  mimeType: string
): Promise<{ uploadUrl: string; filePath: string }> {
  const allowedMimes = ["video/mp4", "video/quicktime", "video/webm"];
  if (!allowedMimes.includes(mimeType)) {
    const error = new Error("Invalid file type. Only MP4, MOV and WebM allowed.");
    (error as any).statusCode = 400;
    throw error;
  }

  const ext = mimeType === "video/quicktime" ? "mov" :
               mimeType === "video/webm" ? "webm" : "mp4";

  const filePath = `courses/${courseId}/lessons/${lessonId}/${uuidv4()}.${ext}`;
  const bucket = firebaseStorage.bucket();
  const file = bucket.file(filePath);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: mimeType,
  });

  return { uploadUrl, filePath };
}

// ----------------------------------------------------------------------------
// Firebase Storage — get public download URL after client upload completes.
// Called by the client after uploading the video to Firebase directly.
// ----------------------------------------------------------------------------
export async function getVideoDownloadUrl(filePath: string): Promise<string> {
  const bucket = firebaseStorage.bucket();
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (!exists) {
    const error = new Error("Video file not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return url;
}

// ----------------------------------------------------------------------------
// Delete thumbnail from Cloudinary (when course is archived or thumbnail replaced)
// ----------------------------------------------------------------------------
export async function deleteThumbnail(thumbnailUrl: string): Promise<void> {
  // Extract public_id from Cloudinary URL
  const parts = thumbnailUrl.split("/");
  const publicIdWithExt = parts.slice(-2).join("/"); // folder/filename
  const publicId = publicIdWithExt.replace(/\.[^.]+$/, ""); // remove extension
  await cloudinary.uploader.destroy(publicId);
}


export async function uploadAvatar(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(mimeType)) {
    const error = new Error("Invalid file type. Only JPG, PNG and WebP allowed.");
    (error as any).statusCode = 400;
    throw error;
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "secure-lms/avatars",
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill" }, // square avatar crop
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}