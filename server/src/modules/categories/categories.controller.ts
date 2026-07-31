import type { Request, Response, NextFunction } from "express";
import * as categoriesService from "./categories.service";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
});

export async function getAllCategories(
  _req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const categories = await categoriesService.getAllCategories();
    res.status(200).json({ categories });
  } catch (error) { next(error); }
}

export async function createCategory(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const category = await categoriesService.createCategory(parsed.data.name);
    res.status(201).json({ category });
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }
    next(error);
  }
}

export async function deleteCategory(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    await categoriesService.deleteCategory(req.params.categoryId as string);
    res.status(204).send();
  } catch (error) { next(error); }
}