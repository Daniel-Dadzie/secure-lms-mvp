import type { Request, Response, NextFunction } from "express";
import { updateProfileSchema, adminResetPasswordSchema } from "./users.schemas";
import * as usersService from "./users.service";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const user = await usersService.getProfile(userId);
    res.status(200).json({ user });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await usersService.updateProfile(userId, parsed.data);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await usersService.listUsers();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function deactivateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const rawUserId = req.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      res.status(400).json({ message: "User ID required" });
      return;
    }

    const user = await usersService.deactivateUser(userId, adminId);
    res.status(200).json({ user });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    next(error);
  }
}

export async function activateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const rawUserId = req.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      res.status(400).json({ message: "User ID required" });
      return;
    }

    const user = await usersService.activateUser(userId, adminId);
    res.status(200).json({ user });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    next(error);
  }
}

export async function resetUserPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const rawUserId = req.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      res.status(400).json({ message: "User ID required" });
      return;
    }

    const parsed = adminResetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    await usersService.resetUserPassword(userId, parsed.data, adminId);
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    next(error);
  }
}