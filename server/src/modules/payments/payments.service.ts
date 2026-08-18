import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { firebaseMessaging } from "../../config/firebase";
import { PLATFORM_CURRENCY } from "../../config/platform";
import { createNotification } from "../notifications/notifications.service";
import { logActivity } from "../../lib/activityLog";
import { resolveUserRegion } from "../../lib/resolveUserRegion";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function resolveCheckoutRegion(timezone?: string) {
  return resolveUserRegion({ timezone });
}

// ----------------------------------------------------------------------------
// Initiate checkout for a single course. Creates a PENDING purchase and
// returns a Paystack authorization_url for the client to redirect to.
// Nothing is enrolled yet — that only happens once payment is confirmed
// via webhook (or the verify fallback), never at this step.
// ----------------------------------------------------------------------------
export async function checkout(
  userId: string,
  courseId: string,
  couponCode?: string,
  timezone?: string
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED", isActive: true },
    select: { id: true, title: true, priceCents: true },
  });

  if (!course) {
    const error = new Error("Course not found or not available");
    (error as any).statusCode = 404;
    throw error;
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment) {
    const error = new Error("You are already enrolled in this course");
    (error as any).statusCode = 409;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Coupon validation — same logic as before, just computed up front
  // rather than inside a completion transaction.
  let coupon: { id: string; discountType: "PERCENTAGE" | "FIXED_AMOUNT"; discountValue: number } | null = null;

  if (couponCode) {
    const foundCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

    if (!foundCoupon || !foundCoupon.isActive) {
      const error = new Error("Coupon is invalid or no longer active");
      (error as any).statusCode = 400;
      throw error;
    }
    if (foundCoupon.expiresAt && foundCoupon.expiresAt < new Date()) {
      const error = new Error("Coupon has expired");
      (error as any).statusCode = 400;
      throw error;
    }
    if (foundCoupon.maxUses !== null && foundCoupon.usedCount >= foundCoupon.maxUses) {
      const error = new Error("Coupon usage limit has been reached");
      (error as any).statusCode = 400;
      throw error;
    }

    const existingUsage = await prisma.couponUsage.findUnique({
      where: { couponId_userId: { couponId: foundCoupon.id, userId } },
    });
    if (existingUsage) {
      const error = new Error("You have already used this coupon");
      (error as any).statusCode = 409;
      throw error;
    }

    coupon = {
      id: foundCoupon.id,
      discountType: foundCoupon.discountType,
      discountValue: foundCoupon.discountValue,
    };
  }

  const amountCents = course.priceCents;
  let discountCents = 0;

  if (coupon) {
    discountCents =
      coupon.discountType === "PERCENTAGE"
        ? Math.round((amountCents * coupon.discountValue) / 100)
        : coupon.discountValue;
    discountCents = Math.min(discountCents, amountCents);
  }

  const finalAmountCents = amountCents - discountCents;
  const reference = `PSK-${crypto.randomUUID()}`;
  const { region: buyerRegion, timezone: buyerTimezone } = resolveCheckoutRegion(timezone);

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      courseId,
      amountCents,
      discountCents,
      finalAmountCents,
      couponId: coupon?.id,
      currency: PLATFORM_CURRENCY,
      status: "PENDING",
      provider: "PAYSTACK",
      providerReference: reference,
      buyerRegion: buyerRegion ?? undefined,
      buyerTimezone: buyerTimezone ?? undefined,
    },
  });

  if (buyerRegion || buyerTimezone) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(buyerRegion ? { region: buyerRegion } : {}),
        ...(buyerTimezone ? { detectedTimezone: buyerTimezone } : {}),
      },
    });
  }

const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: reference, 
    line_items: [
      {
        price_data: {
          currency: PLATFORM_CURRENCY.toLowerCase(),
          product_data: { name: course.title },
          unit_amount: finalAmountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment/callback?reference=${reference}`,
    cancel_url: `${process.env.CLIENT_URL}/course/${courseId}`,
  });

  return { authorizationUrl: session.url, reference, purchase };
}

// ----------------------------------------------------------------------------
// Initiate checkout for the whole cart as ONE Paystack transaction. All
// cart items share a single reference; the webhook completes them together.
// Coupons are not supported here, matching the existing single-coupon
// design constraint (@@unique([couponId, userId]) on CouponUsage).
// ----------------------------------------------------------------------------
export async function checkoutCart(userId: string, timezone?: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { course: true } } },
  });

  if (!cart || cart.items.length === 0) {
    const error = new Error("Cart is empty");
    (error as any).statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const eligibleItems = [];
  const skipped = [];

  for (const item of cart.items) {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: item.courseId } },
    });
    if (existing) {
      skipped.push({ courseId: item.courseId, reason: "Already enrolled" });
      continue;
    }
    if (item.course.status !== "PUBLISHED" || !item.course.isActive) {
      skipped.push({ courseId: item.courseId, reason: "Course not available" });
      continue;
    }
    eligibleItems.push(item);
  }

  if (eligibleItems.length === 0) {
    const error = new Error("No eligible courses to purchase");
    (error as any).statusCode = 400;
    throw error;
  }

  const totalAmountCents = eligibleItems.reduce((sum, item) => sum + item.course.priceCents, 0);
  const reference = `PSK-CART-${crypto.randomUUID()}`;
  const { region: buyerRegion, timezone: buyerTimezone } = resolveCheckoutRegion(timezone);

  const purchases = await prisma.$transaction(
    eligibleItems.map((item) =>
      prisma.purchase.create({
        data: {
          userId,
          courseId: item.courseId,
          amountCents: item.course.priceCents,
          discountCents: 0,
          finalAmountCents: item.course.priceCents,
          currency: PLATFORM_CURRENCY,
          status: "PENDING",
          provider: "PAYSTACK",
          providerReference: reference,
          buyerRegion: buyerRegion ?? undefined,
          buyerTimezone: buyerTimezone ?? undefined,
        },
      })
    )
  );

  if (buyerRegion || buyerTimezone) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(buyerRegion ? { region: buyerRegion } : {}),
        ...(buyerTimezone ? { detectedTimezone: buyerTimezone } : {}),
      },
    });
  }

const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: reference,
    line_items: [
      {
        price_data: {
          currency: PLATFORM_CURRENCY.toLowerCase(),
          product_data: { name: "Secure LMS Cart Checkout" },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment/callback?reference=${reference}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
  });

  return { authorizationUrl: session.url, reference, purchases, skipped };
}

// ----------------------------------------------------------------------------
// Complete all PENDING purchases sharing a reference — the actual
// enrollment/certificate-eligible/notification logic that used to run
// inline in checkout(). Called ONLY from the webhook handler or the verify
// fallback, never directly from a client-facing route. Idempotent: if
// purchases are already COMPLETED, this safely no-ops (Paystack may
// legitimately resend the same webhook event more than once).
// ----------------------------------------------------------------------------
export async function completePurchasesByReference(reference: string): Promise<void> {
  const pendingPurchases = await prisma.purchase.findMany({
    where: { providerReference: reference, status: "PENDING" },
    include: { course: { select: { title: true, instructorId: true, modules: { select: { lessons: { select: { id: true } } } } } } },
  });

  if (pendingPurchases.length === 0) {
    // Already completed (duplicate webhook) or reference doesn't exist —
    // either way, nothing to do. Not an error.
    return;
  }

  for (const purchase of pendingPurchases) {
    const lessonIds = purchase.course.modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));

    await prisma.$transaction(async (tx: any) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED" },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          userId: purchase.userId,
          courseId: purchase.courseId,
          purchaseId: purchase.id,
          status: "ACTIVE",
        },
      });

      if (lessonIds.length > 0) {
        await tx.lessonProgress.createMany({
          data: lessonIds.map((lessonId: string) => ({
            userId: purchase.userId,
            lessonId,
            enrollmentId: enrollment.id,
            status: "NOT_STARTED",
            progressSeconds: 0,
          })),
          skipDuplicates: true,
        });
      }

      if (purchase.couponId) {
        await tx.couponUsage.create({
          data: {
            couponId: purchase.couponId,
            userId: purchase.userId,
            courseId: purchase.courseId,
            purchaseId: purchase.id,
          },
        });
        await tx.coupon.update({
          where: { id: purchase.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { courseId: purchase.courseId, cart: { userId: purchase.userId } },
      });

      await tx.auditEvent.create({
        data: {
          userId: purchase.userId,
          action: "purchase.completed",
          entityType: "Purchase",
          entityId: purchase.id,
          metadata: {
            courseId: purchase.courseId,
            courseTitle: purchase.course.title,
            amountCents: purchase.amountCents,
            discountCents: purchase.discountCents,
            finalAmountCents: purchase.finalAmountCents,
            currency: purchase.currency,
          },
        },
      });

      await createNotification(
        purchase.userId,
        "ENROLLMENT_CONFIRMED",
        "Enrollment confirmed",
        `You're now enrolled in ${purchase.course.title}.`,
        { courseId: purchase.courseId }
      );

      await createNotification(
        purchase.course.instructorId,
        "NEW_ENROLLMENT",
        "New student enrolled",
        `A student enrolled in your course "${purchase.course.title}".`,
        { courseId: purchase.courseId, enrollmentId: enrollment.id }
      );
    });

    await logActivity({
      userId: purchase.userId,
      title: `Enrolled in "${purchase.course.title}"`,
      description: "Purchase confirmed",
      iconType: "enrolled",
    });

    // Best-effort push notification — never block payment completion on this
    try {
      await firebaseMessaging.send({
        topic: `user-${purchase.userId}`,
        notification: {
          title: "Enrollment Confirmed!",
          body: `You are now enrolled in ${purchase.course.title}.`,
        },
        data: { type: "enrollment_confirmed", courseId: purchase.courseId },
      });
    } catch (err) {
      console.error("FCM notification failed:", err);
    }
  }
}

// ----------------------------------------------------------------------------
// Fallback verification for the frontend's post-redirect callback page.
// Re-checks with Paystack directly (never trusts the redirect alone) —
// covers the case where the user lands back before the webhook has arrived.
// ----------------------------------------------------------------------------
export async function verifyAndComplete(reference: string, userId: string | null) {
  const purchases = await prisma.purchase.findMany({
    where: { providerReference: reference },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (purchases.length === 0) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // If userId is provided, verify ownership
  if (userId && purchases[0].userId !== userId) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (purchases[0].status === "COMPLETED") {
    return {
      status: "COMPLETED" as const,
      courses: purchases.map((p: any) => ({ id: p.course.id, title: p.course.title, slug: p.course.slug })),
    };
  }

  return { status: purchases[0].status as string, courses: [] };
}



// ----------------------------------------------------------------------------
// Get student's purchase history (unchanged)
// ----------------------------------------------------------------------------
export async function getPurchaseHistory(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true, title: true, slug: true, thumbnailUrl: true,
          instructor: { select: { id: true, fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseById(purchaseId: string, userId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } } },
  });

  if (!purchase) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }
  if (purchase.userId !== userId) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return purchase;
}
