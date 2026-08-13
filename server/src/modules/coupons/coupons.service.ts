import { prisma } from "../../config/prisma";
import type { DiscountType } from "@prisma/client";

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });
}

export async function createCoupon(data: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
}) {
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) {
    const error = new Error("Coupon code already exists");
    (error as any).statusCode = 409;
    throw error;
  }

  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ?? null,
    },
  });
}

export async function updateCoupon(
  couponId: string,
  data: Partial<{
    discountValue: number;
    maxUses: number | null;
    expiresAt: Date | null;
    isActive: boolean;
  }>
) {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) {
    const error = new Error("Coupon not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return prisma.coupon.update({ where: { id: couponId }, data });
}

export async function deactivateCoupon(couponId: string) {
  return updateCoupon(couponId, { isActive: false });
}
