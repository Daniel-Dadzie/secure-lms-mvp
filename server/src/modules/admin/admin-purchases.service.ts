import { prisma } from "../../config/prisma";

export async function getPurchases(filters: {
  page?: number;
  limit?: number;
  status?: string;
  from?: Date;
  to?: Date;
}) {
  const { page = 1, limit = 20, status, from, to } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as any }),
    ...(from || to
      ? {
          createdAt: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {}),
  };

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.purchase.count({ where }),
  ]);

  return { purchases, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPurchaseById(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });
  if (!purchase) {
    const error = new Error("Purchase not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return purchase;
}

export async function refundPurchase(purchaseId: string, adminId: string) {
  const purchase = await getPurchaseById(purchaseId);
  if (purchase.status === "REFUNDED") {
    const error = new Error("Purchase already refunded");
    (error as any).statusCode = 400;
    throw error;
  }

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: "REFUNDED" },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.purchase_refunded",
      entityType: "Purchase",
      entityId: purchaseId,
    },
  });
}
