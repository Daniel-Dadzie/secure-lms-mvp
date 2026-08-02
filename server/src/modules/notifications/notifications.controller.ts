import type { Request, Response, NextFunction } from "express";
import * as notificationsService from "./notifications.service";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function getNotifications(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination params" });
      return;
    }
    const userId = (req as any).user?.sub;
    const result = await notificationsService.getNotifications(
      userId, parsed.data.page, parsed.data.limit
    );
    res.status(200).json(result);
  } catch (error) { next(error); }
}

export async function markAsRead(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    await notificationsService.markAsRead(req.params.notificationId as string, userId);
    res.status(200).json({ message: "Marked as read" });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function markAllAsRead(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    await notificationsService.markAllAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) { next(error); }
}