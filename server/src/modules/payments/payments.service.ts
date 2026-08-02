import { prisma } from "../../config/prisma";
import { firebaseMessaging } from "../../config/firebase";
import { createNotification } from "../notifications/notifications.service";

// ----------------------------------------------------------------------------
// Simulate checkout for a single course.
// Price is ALWAYS read from the DB — never from the client or cart.
// Optional couponCode is validated and applied server-side; discount amounts
// are never trusted from the client.
// The entire purchase + coupon usage + enrollment + progress initialization
// is wrapped in a single DB transaction: all succeed or all fail together.
// ----------------------------------------------------------------------------
export async function checkout(
  userId: string,
  courseId: string,
  couponCode?: string
) {
  // 1. Verify course exists and is published
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED", isActive: true },
    select: {
      id: true,
      title: true,
      priceCents: true,
      instructorId: true,
      modules: {
        select: {
          lessons: { select: { id: true } },
        },
      },
    },
  });

  if (!course) {
    const error = new Error("Course not found or not available");
    (error as any).statusCode = 404;
    throw error;
  }

  // 2. Check not already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment) {
    const error = new Error("You are already enrolled in this course");
    (error as any).statusCode = 409;
    throw error;
  }

  // 3. Get all lesson IDs for progress initialization
  const lessonIds = course.modules.flatMap((m) =>
    m.lessons.map((l) => l.id)
  );

  // 4. Validate coupon (if provided) BEFORE the transaction — fail fast with
  //    a clear error rather than letting a DB constraint throw mid-transaction.
  let coupon: {
    id: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  } | null = null;

  if (couponCode) {
    const foundCoupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

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

    if (
      foundCoupon.maxUses !== null &&
      foundCoupon.usedCount >= foundCoupon.maxUses
    ) {
      const error = new Error("Coupon usage limit has been reached");
      (error as any).statusCode = 400;
      throw error;
    }

    // Enforce the one-use-per-user rule implied by @@unique([couponId, userId])
    const existingUsage = await prisma.couponUsage.findUnique({
      where: {
        couponId_userId: { couponId: foundCoupon.id, userId },
      },
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

  // 5. Compute discount server-side — never trust a discount amount from the client
  const amountCents = course.priceCents;
  let discountCents = 0;

  if (coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      discountCents = Math.round((amountCents * coupon.discountValue) / 100);
    } else {
      // FIXED_AMOUNT — value is already in cents
      discountCents = coupon.discountValue;
    }
    // Never let a discount exceed the price itself
    discountCents = Math.min(discountCents, amountCents);
  }

  const finalAmountCents = amountCents - discountCents;

  // 6. Atomic transaction: purchase + coupon usage + enrollment + progress records
  const { purchase, enrollment } = await prisma.$transaction(async (tx) => {
    // Create purchase with server-computed price and discount — client cannot tamper
    const purchase = await tx.purchase.create({
      data: {
        userId,
        courseId,
        amountCents,
        discountCents,
        finalAmountCents,
        couponId: coupon?.id,
        currency: "GHS",
        status: "COMPLETED", // simulated — real gateway would start as PENDING
        provider: "SIMULATED",
      },
    });

    // Record coupon usage + increment usedCount atomically with the purchase
    if (coupon) {
      await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          courseId,
          purchaseId: purchase.id,
        },
      });

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create enrollment linked to purchase
    const enrollment = await tx.enrollment.create({
      data: {
        userId,
        courseId,
        purchaseId: purchase.id,
        status: "ACTIVE",
      },
    });

    // Initialize LessonProgress for every lesson in the course
    // so student dashboard shows 0% immediately (not null/missing)
    if (lessonIds.length > 0) {
      await tx.lessonProgress.createMany({
        data: lessonIds.map((lessonId) => ({
          userId,
          lessonId,
          enrollmentId: enrollment.id,
          status: "NOT_STARTED",
          progressSeconds: 0,
        })),
        skipDuplicates: true,
      });
    }

    // Write audit event inside transaction
    await tx.auditEvent.create({
      data: {
        userId,
        action: "purchase.completed",
        entityType: "Purchase",
        entityId: purchase.id,
        metadata: {
          courseId,
          courseTitle: course.title,
          amountCents,
          discountCents,
          finalAmountCents,
          couponCode: couponCode ?? null,
          currency: "GHS",
        },
      },
    });

    // Notify the student
    await createNotification(
      userId,
      "ENROLLMENT_CONFIRMED",
      "Enrollment confirmed",
      `You're now enrolled in ${course.title}.`,
      { courseId }
    );

    return { purchase, enrollment };
  });

  // 7. Remove course from cart after successful purchase
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, courseId },
    });
  }

  // 8. Send FCM push notification (non-blocking — don't fail checkout if this fails)
  try {
    await firebaseMessaging.send({
      topic: `user-${userId}`,
      notification: {
        title: "Enrollment Confirmed!",
        body: `You are now enrolled in ${course.title}. Start learning now!`,
      },
      data: {
        type: "enrollment_confirmed",
        courseId,
        enrollmentId: enrollment.id,
      },
    });
  } catch (notifError) {
    // Log but don't throw — notification failure must not roll back a successful purchase
    console.error("FCM notification failed:", notifError);
  }

  return {
    purchase,
    enrollment,
    course: {
      id: course.id,
      title: course.title,
      priceCents: course.priceCents,
    },
  };
}

// ----------------------------------------------------------------------------
// Checkout entire cart — processes each course sequentially.
// Skips already-enrolled courses gracefully.
// Coupons are not supported in bulk cart checkout — the schema only allows
// one CouponUsage per coupon per user, not per course, so applying a single
// coupon across multiple cart items needs its own design decision.
// ----------------------------------------------------------------------------
export async function checkoutCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          course: { select: { id: true, title: true, priceCents: true, status: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    const error = new Error("Cart is empty");
    (error as any).statusCode = 400;
    throw error;
  }

  const results = [];
  const errors = [];

  for (const item of cart.items) {
    try {
      const result = await checkout(userId, item.courseId);
      results.push(result);
    } catch (err: any) {
      // Already enrolled — skip gracefully
      if (err.statusCode === 409) {
        errors.push({ courseId: item.courseId, reason: err.message });
      } else {
        throw err; // unexpected error — bubble up
      }
    }
  }

  return { purchases: results, skipped: errors };
}

// ----------------------------------------------------------------------------
// Get student's purchase history
// ----------------------------------------------------------------------------
export async function getPurchaseHistory(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: { select: { id: true, fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ----------------------------------------------------------------------------
// Get single purchase detail
// ----------------------------------------------------------------------------
export async function getPurchaseById(purchaseId: string, userId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
        },
      },
    },
  });

  if (!purchase) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Ownership check — student can only see own purchases
  if (purchase.userId !== userId) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return purchase;
}