import { Router } from "express";
import { optionalAuthenticate, authenticate } from "../../middleware";
import * as supportController from "./support.controller";

const router = Router();

router.post("/ask", optionalAuthenticate, supportController.ask);

router.post("/tickets", authenticate, supportController.createTicket);
router.get("/tickets/mine", authenticate, supportController.listMyTickets);
router.get("/tickets/:ticketId", authenticate, supportController.getMyTicket);
router.post("/tickets/:ticketId/reply", authenticate, supportController.replyToMyTicket);

export default router;
