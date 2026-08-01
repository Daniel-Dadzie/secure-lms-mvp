import type { Request, Response, NextFunction } from "express";
import * as cartService from "./cart.service";
import { z } from "zod";

const addToCartSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export async function getCart(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const cart = await cartService.getCart(userId);
    res.status(200).json({ cart });
  } catch (error) { next(error); }
}

export async function addToCart(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const cart = await cartService.addToCart(userId, parsed.data.courseId);
    res.status(201).json({ cart });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    if (error.statusCode === 409) { res.status(409).json({ message: error.message }); return; }
    next(error);
  }
}

export async function removeFromCart(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const cart = await cartService.removeFromCart(userId, req.params.courseId as string);
    res.status(200).json({ cart });
  } catch (error) { next(error); }
}

export async function clearCart(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    await cartService.clearCart(userId);
    res.status(204).send();
  } catch (error) { next(error); }
}