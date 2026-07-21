import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import type { SafeUser } from "../auth/auth.types";
import type { UpdateProfileInput, AdminResetPasswordInput } from "./users.schemas";

function toSafeUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: import("@prisma/client").Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

// ----------------------------------------------------------------------------
// Get own profile
// ----------------------------------------------------------------------------
export async function getProfile(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return toSafeUser(user);
}

// ----------------------------------------------------------------------------
// Update own profile
// ----------------------------------------------------------------------------
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<SafeUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.fullName && { fullName: input.fullName }),
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "user.profile_updated",
      entityType: "User",
      entityId: userId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return toSafeUser(user);
}

// ----------------------------------------------------------------------------
// Admin: list all users
// ----------------------------------------------------------------------------
export async function listUsers(): Promise<SafeUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(toSafeUser);
}

// ----------------------------------------------------------------------------
// Admin: deactivate (suspend) user — soft delete
// ----------------------------------------------------------------------------
export async function deactivateUser(
  targetUserId: string,
  adminId: string
): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Revoke all active refresh tokens for the suspended user —
  // forces immediate re-authentication attempt which will fail
  await prisma.refreshToken.updateMany({
    where: {
      userId: targetUserId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: false },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.user_deactivated",
      entityType: "User",
      entityId: targetUserId,
      metadata: { targetEmail: user.email },
    },
  });

  return toSafeUser(updated);
}

// ----------------------------------------------------------------------------
// Admin: activate user
// ----------------------------------------------------------------------------
export async function activateUser(
  targetUserId: string,
  adminId: string
): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: true },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.user_activated",
      entityType: "User",
      entityId: targetUserId,
      metadata: { targetEmail: user.email },
    },
  });

  return toSafeUser(updated);
}

// ----------------------------------------------------------------------------
// Admin: reset user password
// ----------------------------------------------------------------------------
export async function resetUserPassword(
  targetUserId: string,
  input: AdminResetPasswordInput,
  adminId: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.user.update({
    where: { id: targetUserId },
    data: { passwordHash },
  });

  // Revoke all sessions — user must log in with new password
  await prisma.refreshToken.updateMany({
    where: { userId: targetUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.auditEvent.create({
    data: {
      userId: adminId,
      action: "admin.user_password_reset",
      entityType: "User",
      entityId: targetUserId,
      metadata: { targetEmail: user.email },
    },
  });
}