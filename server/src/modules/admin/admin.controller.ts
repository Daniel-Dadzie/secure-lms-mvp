import type { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";
import { z } from "zod";

const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function getPlatformStats(
  _req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(200).json({ stats });
  } catch (error) { next(error); }
}

export async function getAuditLog(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = auditLogFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid filters" });
      return;
    }
    const result = await adminService.getAuditLog(parsed.data);
    res.status(200).json(result);
  } catch (error) { next(error); }
}

export async function getAllCourses(
  _req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const courses = await adminService.getAllCoursesAdmin();
    res.status(200).json({ courses });
  } catch (error) { next(error); }
}

export async function getAllUsers(
  _req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const users = await adminService.getAllUsersAdmin();
    res.status(200).json({ users });
  } catch (error) { next(error); }
}

export async function verifyUserEmail(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await adminService.verifyUserEmail(req.params.userId as string, adminId);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) { next(error); }
}