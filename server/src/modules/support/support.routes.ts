import { Router } from "express";
import { optionalAuthenticate } from "../../middleware";
import * as supportController from "./support.controller";

const router = Router();

// Public — available to all users including unauthenticated.
// optionalAuthenticate attaches req.user when a valid token is present,
// so logged-in users' questions get tied to their account in the audit log,
// without requiring authentication for anonymous visitors.
router.post("/ask", optionalAuthenticate, supportController.ask);

export default router;
