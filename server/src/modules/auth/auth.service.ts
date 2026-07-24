import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { JWT_CONFIG } from "../../config/jwt";
import type { RegisterInput, LoginInput } from "./auth.schemas";
import type { AuthResult, JwtPayload, SafeUser, TokenPair } from "./auth.types";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

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

function generateTokenPair(
  userId: string,
  role: import("@prisma/client").Role
): TokenPair {
  const accessPayload: JwtPayload = {
    sub: userId,
    role,
    jti: crypto.randomUUID(),
  };

  const accessToken = jwt.sign(
    accessPayload,
    JWT_CONFIG.accessSecret,
    {
      expiresIn: JWT_CONFIG.accessExpiresIn as any,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
      jti: crypto.randomUUID(),
    },
    JWT_CONFIG.refreshSecret,
    {
      expiresIn: JWT_CONFIG.refreshExpiresIn as any,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }
  );

  return {
    accessToken,
    refreshToken,
  };
}

async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  family: string
): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + JWT_CONFIG.refreshExpiryMs);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      family,
      expiresAt,
    },
  });
}

// ----------------------------------------------------------------------------
// Service methods
// ----------------------------------------------------------------------------

export async function register(input: RegisterInput): Promise<AuthResult> {
  // 1. Check if email already exists — return generic error to avoid
  //    user enumeration (security requirement from threat model)
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    const error = new Error("Registration failed");
    (error as any).statusCode = 409;
    throw error;
  }

  // 2. Hash password — bcrypt work factor 12 per security policy
  const passwordHash = await bcrypt.hash(input.password, 12);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
    },
  });

  // 4. Generate tokens
  const family = crypto.randomUUID();
  const tokens = generateTokenPair(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken, family);

  // 5. Write audit event
  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      action: "auth.register",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role },
    },
  });

  return { tokens, user: toSafeUser(user) };
}

export async function login(
  input: LoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  // 1. Find user — use generic error on any failure to prevent
  //    user enumeration (security team requirement)
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  const genericError = new Error("Invalid email or password");
  (genericError as any).statusCode = 401;

  if (!user || !user.isActive) {
    // Write failed login audit event even when user doesn't exist —
    // record the attempt without exposing which condition failed
    await prisma.auditEvent.create({
      data: {
        action: "auth.login_failed",
        metadata: { email: input.email, reason: "user_not_found_or_inactive" },
        ipAddress,
        userAgent,
      },
    });
    throw genericError;
  }

  // 2. Verify password
  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordValid) {
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        action: "auth.login_failed",
        entityType: "User",
        entityId: user.id,
        metadata: { reason: "invalid_password" },
        ipAddress,
        userAgent,
      },
    });
    throw genericError;
  }

  // 3. Generate tokens
  const family = crypto.randomUUID();
  const tokens = generateTokenPair(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken, family);

  // 4. Write successful login audit event
  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      action: "auth.login_success",
      entityType: "User",
      entityId: user.id,
      ipAddress,
      userAgent,
    },
  });

  return { tokens, user: toSafeUser(user) };
}

export async function refresh(
  incomingRefreshToken: string,
  ipAddress?: string
): Promise<TokenPair> {
  const genericError = new Error("Invalid or expired refresh token");
  (genericError as any).statusCode = 401;

  // 1. Verify the refresh token signature and required JWT claims
  try {
    jwt.verify(
      incomingRefreshToken,
      JWT_CONFIG.refreshSecret,
      {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
      }
    );
  } catch {
    throw genericError;
  }

  // 2. Hash the incoming token and look it up
  const tokenHash = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  // 3. Reuse detection — if the token exists but is already revoked,
  //    this is a replay attack: revoke the entire family immediately
  if (storedToken && storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { family: storedToken.family },
      data: { revokedAt: new Date() },
    });

    await prisma.auditEvent.create({
      data: {
        userId: storedToken.userId,
        action: "auth.refresh_token_reuse_detected",
        entityType: "User",
        entityId: storedToken.userId,
        metadata: { family: storedToken.family },
        ipAddress,
      },
    });

    throw genericError;
  }

  // 4. Token not found or expired
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw genericError;
  }

  // 5. Rotate — revoke the old token, issue a new one in the same family
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date(), lastUsedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });

  if (!user || !user.isActive) throw genericError;

  const newTokens = generateTokenPair(user.id, user.role);
  await storeRefreshToken(user.id, newTokens.refreshToken, storedToken.family);

  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      action: "auth.token_refresh",
      entityType: "User",
      entityId: user.id,
      ipAddress,
    },
  });

  return newTokens;
}

export async function logout(
  refreshToken: string,
  userId?: string
): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "auth.logout",
      entityType: "User",
      entityId: userId,
    },
  });
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
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
