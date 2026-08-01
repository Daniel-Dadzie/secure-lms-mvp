import { Router } from "express";
import * as supportController from "./support.controller";

const router = Router();

// Public — support assistant available to all users including unauthenticated
router.post("/ask", supportController.ask);

export default router;