import type { Request, Response, NextFunction } from "express";
import * as paymentsService from "./payments.service";

import { z } from "zod";


import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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
// Paystack webhook — public, but every request is verified via HMAC
// signature before any data is trusted. Always responds 200 quickly once
// verified, even if internal processing is still async, per Paystack's
// requirements.
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Stripe webhook — public, but every request is verified via Stripe's
// digital signature before any data is trusted.
// ----------------------------------------------------------------------------
export async function webhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !rawBody) {
    res.status(400).json({ message: "Missing signature or payload body" });
    return;
  }

  let event: Stripe.Event;

  try {
    // This verifies the signature and parses the raw data safely
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Stripe Webhook signature verification failed:", err.message);
    res.status(401).send(`Webhook Error: ${err.message}`);
    return;
  }

  // If the payment is completely successful, enroll the student!
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reference = session.client_reference_id;

    if (reference) {
      try {
        await paymentsService.completePurchasesByReference(reference);
      } catch (err) {
        console.error("Webhook database processing error:", err);
      }
    }
  }

  // Acknowledge receipt to Stripe immediately
  res.status(200).json({ received: true });
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Allow verification without authentication for the callback page
    // The reference is enough to identify and verify the purchase
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
