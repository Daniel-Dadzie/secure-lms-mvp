import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { sendForgotPasswordEmail } from "../../services/email.service";

// ----------------------------------------------------------------------------
// Request a password reset. Always succeeds from the caller's perspective
// regardless of whether the email exists — same user-enumeration prevention
// pattern already used in register/login. Only sends an email if the account
// is real and active.
// ----------------------------------------------------------------------------
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately do NOT throw or vary behavior if the user doesn't exist —
  // that would let an attacker enumerate valid emails by observing timing
  // or response differences. Silently no-op instead.
  if (!user || !user.isActive) {
    return;
  }

  // Invalidate any existing unused reset tokens for this user —
  // only the most recent reset link should be valid.
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour — shorter than email verification, since this grants account access

await prisma.passwordReset.create({
    data: { userId: user.id, token, tokenHash, expiresAt },
  });

  await sendForgotPasswordEmail(user.email, user.fullName, token, expiresAt);

  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      action: "auth.password_reset_requested",
      entityType: "User",
      entityId: user.id,
    },
  });
}

// ----------------------------------------------------------------------------
// Complete a password reset — validate token, set new password, and revoke
// ALL existing sessions (refresh tokens) so a stolen old session can't
// persist past the reset, matching the admin-reset behavior.
// ----------------------------------------------------------------------------
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await prisma.passwordReset.findUnique({
    where: { tokenHash },
  });

  if (!resetRecord) {
    const error = new Error("Invalid or expired reset link");
    (error as any).statusCode = 400;
    throw error;
  }

  if (resetRecord.usedAt) {
    const error = new Error("This reset link has already been used");
    (error as any).statusCode = 400;
    throw error;
  }

  if (resetRecord.expiresAt < new Date()) {
    const error = new Error("This reset link has expired");
    (error as any).statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    // Revoke every active refresh token — force re-login everywhere,
    // same protective behavior as the admin-triggered reset.
    prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await prisma.auditEvent.create({
    data: {
      userId: resetRecord.userId,
      action: "auth.password_reset_completed",
      entityType: "User",
      entityId: resetRecord.userId,
    },
  });
}