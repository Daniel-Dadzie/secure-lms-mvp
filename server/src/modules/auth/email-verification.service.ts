import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { sendVerificationEmail } from "../../services/email.service";

// ----------------------------------------------------------------------------
// Generate a verification token, hash it, store it, send the email.
// The token sent in the email is the raw UUID.
// Only the hash is stored in the DB — same pattern as refresh tokens.
// ----------------------------------------------------------------------------
export async function sendVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.isEmailVerified) throw new Error("Email already verified");

  // Invalidate any existing unused tokens for this user
  await prisma.emailVerification.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.create({
    data: { userId, token, tokenHash, expiresAt },
  });

  await sendVerificationEmail(user.email, user.fullName, token);

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "auth.verification_email_sent",
      entityType: "User",
      entityId: userId,
    },
  });
}

// ----------------------------------------------------------------------------
// Verify the token — hash it, look it up, mark as used, set isEmailVerified.
// ----------------------------------------------------------------------------
export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const verification = await prisma.emailVerification.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!verification) {
    const error = new Error("Invalid or expired verification link");
    (error as any).statusCode = 400;
    throw error;
  }

  if (verification.usedAt) {
    const error = new Error("Verification link already used or expired");
    (error as any).statusCode = 400;
    throw error;
  }

  if (verification.expiresAt < new Date()) {
    const error = new Error("Verification link has expired");
    (error as any).statusCode = 400;
    throw error;
  }

  // Mark token as used and verify the user atomically
  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    }),
  ]);

  await prisma.auditEvent.create({
    data: {
      userId: verification.userId,
      action: "auth.email_verified",
      entityType: "User",
      entityId: verification.userId,
    },
  });
}
