import { Router } from "express";
import { authenticate } from "../../middleware";
import * as notificationsController from "./notifications.controller";

const router = Router();

router.get("/", authenticate, notificationsController.getNotifications);
router.patch("/:notificationId/read", authenticate, notificationsController.markAsRead);
router.patch("/read-all", authenticate, notificationsController.markAllAsRead);

export default router;