import type { Request, Response, NextFunction } from "express";
import * as paymentsService from "./payments.service";
import { z } from "zod";
import crypto from "crypto";

const checkoutSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  couponCode: z.string().trim().min(1).optional(),
  timezone: z.string().min(1).max(100).optional(),
});

const checkoutCartSchema = z.object({
  timezone: z.string().min(1).max(100).optional(),
});

export async function checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const result = await paymentsService.checkout(
      userId,
      parsed.data.courseId,
      parsed.data.couponCode,
      parsed.data.timezone
    );
    res.status(200).json(result);
  } catch (error: any) {
    if ([400, 404, 409, 502].includes(error.statusCode)) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function checkoutCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const parsed = checkoutCartSchema.safeParse(req.body ?? {});
    const timezone = parsed.success ? parsed.data.timezone : undefined;
    const result = await paymentsService.checkoutCart(userId, timezone);
    res.status(200).json(result);
  } catch (error: any) {
    if ([400, 502].includes(error.statusCode)) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
}

// ----------------------------------------------------------------------------
// Paystack webhook — public, verified via HMAC SHA512 signature using
// Paystack's secret key before any data is trusted. Responds 200 immediately.
// ----------------------------------------------------------------------------
export async function webhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["x-paystack-signature"] as string;

  if (!signature) {
    res.status(400).json({ message: "Missing Paystack signature header" });
    return;
  }

  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    res.status(401).json({ message: "Invalid signature" });
    return;
  }

  // Acknowledge receipt to Paystack immediately
  res.status(200).json({ received: true });

  const event = req.body;
  if (event && event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      try {
        await paymentsService.completePurchasesByReference(reference);
      } catch (err) {
        console.error("Webhook database processing error:", err);
      }
    }
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const result = await paymentsService.verifyAndComplete(req.params.reference as string, userId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function getPurchaseHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const purchases = await paymentsService.getPurchaseHistory(userId);
    res.status(200).json({ purchases });
  } catch (error) { next(error); }
}

export async function getPurchaseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const purchase = await paymentsService.getPurchaseById(req.params.purchaseId as string, userId);
    res.status(200).json({ purchase });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Purchase not found" }); return; }
    next(error);
  }
}