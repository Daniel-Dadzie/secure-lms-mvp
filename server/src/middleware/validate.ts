import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// ----------------------------------------------------------------------------
// validate middleware factory
// Validates req.body against a Zod schema before the request reaches
// the controller. Unknown fields are stripped (Zod default behaviour).
// On failure, returns 400 with structured field errors.
//
// Usage: router.post("/route", validate(mySchema), controller.handler)
// ----------------------------------------------------------------------------
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Replace req.body with the parsed (stripped + coerced) data
    req.body = result.data;
    next();
  };
}