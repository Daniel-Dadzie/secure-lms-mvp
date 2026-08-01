import type { Request, Response, NextFunction } from "express";
import * as supportService from "./support.service";
import { z } from "zod";

const askSchema = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question cannot exceed 500 characters")
    .trim(),
});

export async function ask(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = askSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = (req as any).user?.sub;
    const result = await supportService.askSupport(parsed.data.question, userId);
    res.status(200).json(result);
  } catch (error) { next(error); }
}