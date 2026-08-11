import { Router } from "express";
import multer from "multer";
import { uploadAvatar } from "../../services/upload.service";
import { authenticate } from "../../middleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/", authenticate, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    const url = await uploadAvatar(req.file.buffer, req.file.mimetype);
    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});

export default router;