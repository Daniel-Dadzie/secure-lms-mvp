import { prisma } from "../config/prisma";

export type ActivityIconType = "enrolled" | "completed" | "badge" | "certificate";

export async function logActivity(params: {
  userId: string;
  title: string;
  description?: string;
  iconType: ActivityIconType;
}): Promise<void> {
  await prisma.activity.create({
    data: {
      userId: params.userId,
      title: params.title,
      description: params.description,
      iconType: params.iconType,
    },
  });
}

/** Skip insert when the same user already has an activity with this title + icon. */
export async function logActivityOnce(params: {
  userId: string;
  title: string;
  description?: string;
  iconType: ActivityIconType;
}): Promise<void> {
  const existing = await prisma.activity.findFirst({
    where: {
      userId: params.userId,
      iconType: params.iconType,
      title: params.title,
    },
    select: { id: true },
  });

  if (existing) return;

  await logActivity(params);
}
