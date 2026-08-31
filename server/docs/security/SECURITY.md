# Secure LMS — Security Documentation

This document describes the security architecture, controls, and operational practices for the Secure LMS MVP. It aligns with the STRIDE threat model in the technical proposal and serves as the reference for cybersecurity reviews through Week 5 release sign-off.

## Table of contents

1. [Authentication](#authentication)
2. [Role-based access control (RBAC)](#role-based-access-control-rbac)
3. [Session management](#session-management)
4. [IDOR prevention and ownership checks](#idor-prevention-and-ownership-checks)
5. [Audit logging](#audit-logging)
6. [Security headers and hardening](#security-headers-and-hardening)
7. [DevSecOps pipeline](#devsecops-pipeline)
8. [Branch protection](#branch-protection)
9. [STRIDE threat model mapping](#stride-threat-model-mapping)
10. [Security testing](#security-testing)

---

## Authentication

### Overview

Authentication is implemented natively in the Node.js/Express server using JWT access tokens and opaque refresh tokens stored server-side. Firebase Auth is **not** used for primary authentication — this keeps password hashing, token issuance, and session lifecycle fully owned and reviewable by the team.

### Password hashing

- Algorithm: **bcrypt** with work factor **12**
- Plaintext passwords are never stored or returned by API serializers
- Admin password reset re-hashes with the same work factor and revokes all active sessions

### JWT access tokens

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Secret | `JWT_ACCESS_SECRET` (minimum 32 characters) |
| Default TTL | 15 minutes (`JWT_ACCESS_EXPIRES_IN`) |
| Issuer | `secure-lms-api` |
| Audience | `secure-lms-client` |
| Claims | `sub` (user ID), `role`, `jti` (unique token ID) |

Access tokens are sent in the `Authorization: Bearer <token>` header. The `authenticate` middleware validates signature, expiry, issuer, and audience on every protected request.

### Refresh tokens

| Property | Value |
|---|---|
| Storage | SHA-256 hash in `refresh_tokens` table (never plaintext) |
| Delivery | `httpOnly`, `SameSite=Strict`, path-scoped to `/api/auth` cookie |
| Default TTL | 7 days |
| Rotation | Atomic via Prisma transaction on every refresh |
| Family tracking | Tokens grouped by `family` UUID for reuse detection |

**Rotation flow:** On refresh, the old token is revoked and a new token is issued in the same family inside a single database transaction. If any step fails (e.g. user deactivated mid-rotation), the transaction rolls back.

**Reuse detection:** If a revoked token is presented again, the entire token family is revoked immediately and an `auth.refresh_token_reuse_detected` audit event is written.

**Logout:** All tokens in the refresh token's family are revoked, ensuring complete session invalidation.

### Public registration restrictions

Public `POST /api/auth/register` accepts **STUDENT** role only (`z.literal("STUDENT")` in `registerSchema`). ADMIN and INSTRUCTOR roles cannot be self-assigned. Instructor promotion requires a separate admin workflow (future endpoint).

### User enumeration prevention

- Registration duplicate email → generic `409 Registration failed`
- Login failures (wrong password, unknown email, inactive account) → generic `401 Invalid email or password`
- Failed login attempts are audit-logged without exposing which condition failed

### Rate limiting

Auth endpoints use `express-rate-limit`:

- Login/register: 10 failed attempts per 15 minutes per IP
- Refresh: 30 attempts per 15 minutes per IP

---

## Role-based access control (RBAC)

### Roles

| Role | Description |
|---|---|
| `STUDENT` | Enrol in courses, track progress, view own certificates |
| `INSTRUCTOR` | Create and manage own courses, modules, lessons |
| `ADMIN` | Full user management, moderation, bypass ownership checks |

Role is a denormalized enum on the `User` model for performance on hot-path authorization checks.

### Middleware stack

Protected routes use middleware in this order:

1. `authenticate` — verify JWT access token
2. `requireRole([...])` — enforce role allowlist (deny-by-default → 403)
3. `requireOwnership("resource")` — verify resource ownership (404 for non-owned resources)

### Route protection audit (Week 2)

| Route prefix | Authentication | Role enforcement | Ownership |
|---|---|---|---|
| `POST /api/auth/register` | Public (rate-limited) | N/A | N/A |
| `POST /api/auth/login` | Public (rate-limited) | N/A | N/A |
| `POST /api/auth/logout` | Public | N/A | N/A |
| `POST /api/auth/refresh` | Cookie-based | N/A | N/A |
| `GET /api/auth/me` | Required | N/A | N/A |
| `GET/PATCH /api/users/profile` | Required | Any authenticated | Self only (via `req.user.sub`) |
| `GET /api/users/admin/users` | Required | ADMIN only | N/A |
| `POST /api/users/admin/users/:id/deactivate` | Required | ADMIN only | N/A |
| `POST /api/users/admin/users/:id/activate` | Required | ADMIN only | N/A |
| `POST /api/users/admin/users/:id/reset-password` | Required | ADMIN only | N/A |
| `GET /api/health` | Public | N/A | N/A |

Permission denials emit structured JSON to stdout (`auth.permission_denied`) for SIEM ingestion. They are **not** written to the `AuditEvent` table to avoid DB latency and DoS surface on high-volume denial paths.

---

## Session management

### Cookie configuration

```typescript
{
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: 7 days
}