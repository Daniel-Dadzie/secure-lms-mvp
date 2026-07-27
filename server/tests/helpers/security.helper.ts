import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_CONFIG } from "../../src/config/jwt";
import { Role } from "@prisma/client";
import { JwtPayload } from "../../src/modules/auth/auth.types";
import supertest from "supertest";

/**
 * Generates a valid access token for a given user ID and role.
 */
export function generateAccessToken(userId: string, role: Role): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    expiresIn: JWT_CONFIG.accessExpiresIn as any,
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
}

/**
 * Generates an expired access token.
 */
export function generateExpiredAccessToken(userId: string, role: Role): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
    jti: crypto.randomUUID(),
    // set iat and exp in the past
    iat: Math.floor(Date.now() / 1000) - 3600,
    exp: Math.floor(Date.now() / 1000) - 1800,
  };

  // We sign it using jwt.sign but without expiresIn to respect our manual iat/exp
  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
}

/**
 * Generates a token signed with an invalid/wrong secret.
 */
export function generateTokenWithWrongSecret(userId: string, role: Role): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, "completely-wrong-secret-key-that-will-fail-verification", {
    expiresIn: "15m",
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
}

/**
 * Generates a malformed token (e.g. truncated or random characters).
 */
export function generateMalformedToken(): string {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature";
}

/**
 * Generates an expired refresh token (valid signature, past expiry).
 */
export function generateExpiredRefreshToken(userId: string): string {
  const payload = {
    sub: userId,
    jti: crypto.randomUUID(),
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  };

  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
}

/**
 * Helper to assert that a route requires authentication.
 */
export async function attemptUnauthorizedAccess(
  request: supertest.Agent,
  url: string,
  method: "get" | "post" | "put" | "patch" | "delete" = "get",
  body?: any
): Promise<supertest.Response> {
  const req = request[method](url);
  if (body) {
    req.send(body);
  }
  const res = await req;
  expect(res.status).toBe(401);
  return res;
}

/**
 * Helper to assert that a role-based check prevents access.
 */
export async function attemptPrivilegeEscalation(
  request: supertest.Agent,
  url: string,
  token: string,
  method: "get" | "post" | "put" | "patch" | "delete" = "get",
  body?: any
): Promise<supertest.Response> {
  const req = request[method](url)
    .set("Authorization", `Bearer ${token}`);
  if (body) {
    req.send(body);
  }
  const res = await req;
  expect(res.status).toBe(403);
  return res;
}

/**
 * Helper to assert IDOR/ownership protection (returns 404 per policy).
 */
export async function attemptIDOR(
  request: supertest.Agent,
  url: string,
  token: string,
  method: "get" | "post" | "put" | "patch" | "delete" = "get",
  body?: any
): Promise<supertest.Response> {
  const req = request[method](url)
    .set("Authorization", `Bearer ${token}`);
  if (body) {
    req.send(body);
  }
  const res = await req;
  // Threat model: we return 404 instead of 403 to prevent resource existence enumeration.
  expect(res.status).toBe(404);
  return res;
}
