import { Router } from "express";
import { getDashboardHandler } from "./student.controller";
// Import your authentication middleware path (adjust as needed for your project)
import { authenticate } from "./../../middleware/authenticate"; 

const router = Router();

// GET /api/student/dashboard
router.get("/dashboard", authenticate, getDashboardHandler);

export default router;