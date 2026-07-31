import multer from "multer";

// ----------------------------------------------------------------------------
// Multer configured for memory storage — file buffer passed to Cloudinary.
// File size limit: 5MB for images (videos go directly to Firebase, bypassing this)
// ----------------------------------------------------------------------------
export const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG and WebP allowed."));
    }
  },
});