import type { Request, Response, NextFunction } from "express";
import * as modulesService from "./modules.service";
import { createModuleSchema, updateModuleSchema, reorderModulesSchema } from "./modules.schemas";

export async function getModulesByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await modulesService.getModulesByCourse(req.params.courseId as string);
    res.status(200).json({ modules });
  } catch (error) { next(error); }
}

export async function createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const module = await modulesService.createModule(req.params.courseId as string, parsed.data, userId);
    res.status(201).json({ module });
  } catch (error) { next(error); }
}

export async function updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const module = await modulesService.updateModule(req.params.moduleId as string, parsed.data, userId);
    res.status(200).json({ module });
  } catch (error) { next(error); }
}

export async function deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    await modulesService.deleteModule(req.params.moduleId as string, userId);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function reorderModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = reorderModulesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    await modulesService.reorderModules(req.params.courseId as string, parsed.data, userId);
    res.status(200).json({ message: "Modules reordered" });
  } catch (error) { next(error); }
}