import { prisma } from "../../config/prisma";

const cartSelect = {
  id: true,
  userId: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      courseId: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          priceCents: true,
          status: true,
          instructor: {
            select: { id: true, fullName: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

// ----------------------------------------------------------------------------
// Compute order summary from cart items.
// Price always read from course record — never from client input.
// ----------------------------------------------------------------------------
function computeOrderSummary(items: any[]) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.course.priceCents,
    0
  );
  return {
    itemCount: items.length,
    subtotalCents,
    totalCents: subtotalCents, // extend here for coupons/discounts later
  };
}

// ----------------------------------------------------------------------------
// Get or create cart for user — every user has exactly one persistent cart
// ----------------------------------------------------------------------------
async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    select: cartSelect,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    select: cartSelect,
  });
}

// ----------------------------------------------------------------------------
// Get cart with order summary
// ----------------------------------------------------------------------------
export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const summary = computeOrderSummary(cart.items);
  return { ...cart, summary };
}

// ----------------------------------------------------------------------------
// Add course to cart
// Validates: course exists, is PUBLISHED, student not already enrolled
// ----------------------------------------------------------------------------
export async function addToCart(userId: string, courseId: string) {
  // 1. Verify course exists and is published
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED", isActive: true },
    select: { id: true, title: true, priceCents: true },
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

  // 3. Get or create cart
  const cart = await getOrCreateCart(userId);

  // 4. Check not already in cart (@@unique enforces this at DB level too)
  const existingItem = cart.items.find((item) => item.courseId === courseId);
  if (existingItem) {
    const error = new Error("Course is already in your cart");
    (error as any).statusCode = 409;
    throw error;
  }

  // 5. Add item
  await prisma.cartItem.create({
    data: { cartId: cart.id, courseId },
  });

  // Return updated cart
  return getCart(userId);
}

// ----------------------------------------------------------------------------
// Remove course from cart
// ----------------------------------------------------------------------------
export async function removeFromCart(userId: string, courseId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    const error = new Error("Cart not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, courseId },
  });

  return getCart(userId);
}

// ----------------------------------------------------------------------------
// Clear entire cart
// ----------------------------------------------------------------------------
export async function clearCart(userId: string): Promise<void> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}