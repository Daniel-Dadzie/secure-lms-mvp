import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalAuthenticate, authenticate } from "../../middleware";
import * as supportController from "./support.controller";

const router = Router();

const askRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many questions — please wait a moment and try again.",
  },
});

router.post("/ask", askRateLimit, optionalAuthenticate, supportController.ask);

router.post("/tickets", authenticate, supportController.createTicket);
router.get("/tickets/mine", authenticate, supportController.listMyTickets);
router.get("/tickets/:ticketId", authenticate, supportController.getMyTicket);
router.post("/tickets/:ticketId/reply", authenticate, supportController.replyToMyTicket);

export default router;
