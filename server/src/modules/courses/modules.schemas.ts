import { z } from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  order: z.number().int().min(1),
});

export const updateModuleSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  order: z.number().int().min(1).optional(),
});

export const reorderModulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(1),
    })
  ),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;