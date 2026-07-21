import { Role } from "@prisma/client";

// ----------------------------------------------------------------------------
// JWT payload — what gets signed into the access token.
// Kept minimal deliberately: userId + role only, no email or other PII.
// The security team confirmed: userId, role, iat, exp, jti only.
// ----------------------------------------------------------------------------
export interface JwtPayload {
  sub: string;   // userId
  role: Role;
  iat?: number;  // issued at — added automatically by jsonwebtoken
  exp?: number;  // expiry — added automatically by jsonwebtoken
  jti?: string;  // JWT ID — included for traceability, not blocklist revocation
}

// ----------------------------------------------------------------------------
// Token pair returned by register/login/refresh operations.
// accessToken goes to the client as a response body value (held in memory).
// refreshToken is set as an httpOnly cookie by the controller — never
// returned in the response body.
// ----------------------------------------------------------------------------
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ----------------------------------------------------------------------------
// What the auth service returns after a successful login or register.
// ----------------------------------------------------------------------------
export interface AuthResult {
  tokens: TokenPair;
  user: SafeUser;
}

// ----------------------------------------------------------------------------
// Safe user shape — never includes passwordHash.
// This is what gets serialized into API responses.
// ----------------------------------------------------------------------------
export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

// ----------------------------------------------------------------------------
// Extends Express Request so req.user is typed everywhere after
// the authenticate middleware runs.
// ----------------------------------------------------------------------------
export interface AuthenticatedRequest extends Express.Request {
  user: JwtPayload;
}