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
```

### Concurrent sessions

Each login creates a new token family. Users may have multiple active sessions (e.g. phone + laptop). Logout revokes only the family associated with the logout cookie; other families remain active until their refresh token expires or the user is deactivated.

### Forced session invalidation

All active refresh tokens are revoked when:

- Admin deactivates a user
- Admin resets a user's password
- Refresh token reuse is detected
- User logs out (entire family revoked)

---

## IDOR prevention and ownership checks

The `requireOwnership` middleware supports these resource types:

| Resource | Param | Ownership rule | Admin bypass |
|---|---|---|---|
| `course` | `:courseId` | `course.instructorId === user.sub` | Yes |
| `module` | `:moduleId` | Parent course instructor | Yes |
| `enrollment` | `:enrollmentId` | `enrollment.userId === user.sub` | Yes |
| `purchase` | `:purchaseId` | `purchase.userId === user.sub` | Yes |
| `lesson` | `:lessonProgressId` | `lessonProgress.userId === user.sub` | Yes |
| `certificate` | `:certificateId` | `certificate.userId === user.sub` | Yes |

**404 vs 403 policy:** Non-owned resources return **404 Not Found** instead of 403 Forbidden. This prevents attackers from enumerating valid resource IDs (information disclosure per STRIDE).

---

## Audit logging

### Design principles

- **Append-only:** `AuditEvent` has no `updatedAt` field; the application layer exposes no UPDATE or DELETE operations on audit records
- **Structured metadata:** Action-specific details stored in JSON `metadata` column
- **Nullable userId:** System-triggered events (e.g. failed login for unknown email) may have no associated user

### Required audit events

| Action | Trigger |
|---|---|
| `auth.register` | Successful registration |
| `auth.login_success` | Successful login |
| `auth.login_failed` | Failed login (any reason) |
| `auth.logout` | User logout |
| `auth.token_refresh` | Successful token rotation |
| `auth.refresh_token_reuse_detected` | Replay attack detected |
| `user.profile_updated` | Profile mutation |
| `admin.user_deactivated` | Admin suspends user |
| `admin.user_activated` | Admin reactivates user |
| `admin.user_password_reset` | Admin resets password |

Future modules (courses, enrollments, purchases) must write audit events for all state-changing operations before release.

---

## Security headers and hardening

### Helmet

`helmet()` is applied after CORS middleware in `app.ts`. It sets:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` (clickjacking protection)
- `Strict-Transport-Security` (production)
- Additional OWASP-recommended headers

### Request size limit

```typescript
app.use(express.json({ limit: "10kb" }));
```

Oversized JSON payloads are rejected with HTTP 413.

### Error handling

The global error handler returns generic messages to clients. Stack traces and internal details are logged server-side only.

### CORS

Restricted to `CLIENT_URL` (default `http://localhost:3000`) with credentials enabled for cookie-based refresh tokens.

---

## DevSecOps pipeline

### CI workflows

| Workflow | File | Purpose |
|---|---|---|
| CI | `.github/workflows/ci.yml` | Lint, build, test, dependency scan |
| Security Pipeline | `.github/workflows/security.yml` | Gitleaks, npm audit, Semgrep |

### Action pinning

All GitHub Actions are pinned to full 40-character commit SHAs (SEC-013). Tags are preserved as inline comments for readability. Dependabot's `github-actions` ecosystem entry auto-bumps SHAs on new releases with a 7-day cooldown.

### Secret scanning (Gitleaks)

Configuration: `.gitleaks.toml`

- Uses Gitleaks default rules
- Allowlist: build artifacts only (`dist`, `build`, `.next`, `coverage`, `security-logs`)
- `node_modules` is excluded via `.gitignore`, not the allowlist
- Placeholder regexes for documented fake values only

### Dependency scanning

- **Dependabot:** Weekly scans with 7-day cooldown on npm, GitHub Actions, and Docker ecosystems
- **npm audit:** Runs in CI at `--audit-level=high` for all workspaces (client, server, packages/shared)

### Static analysis (Semgrep)

Runs OWASP Top Ten, JavaScript, TypeScript, Express, and React rulesets. Non-blocking in Weeks 1–2 while rules are tuned; blocking from Week 3.

### Local security runner

```bash
./run_security_checks.sh
```

Runs Gitleaks, npm audit (all workspaces), and Semgrep locally. Missing tools cause a **blocking failure** (exit code 1). Logs are written to `security-logs/`.

---

## Branch protection

### Current rules (GitHub `main` branch)

Documented as of Week 2 implementation review:

| Rule | Status |
|---|---|
| Require pull request before merging | Enabled |
| Required approvals | 1 minimum |
| Dismiss stale reviews on new commits | Recommended |
| Require status checks (CI + Security Pipeline) | Enabled on PRs to `main`/`develop` |
| Restrict force pushes | Enabled |
| Restrict deletions | Enabled |

### Security-sensitive review requirements

Per `CONTRIBUTING.md`, changes touching **auth, RBAC, payments, or data validation** must tag a cybersecurity team reviewer (Emmanuel, Amuzie, or Fedelis).

### Known gaps

- Dedicated CODEOWNERS file for automatic security reviewer assignment is planned for Week 3
- Semgrep SAST gate remains non-blocking until rule tuning completes

---

## STRIDE threat model mapping

| STRIDE category | Threat | Mitigation |
|---|---|---|
| **Spoofing** | Credential stuffing / brute force | Rate limiting on auth endpoints, bcrypt hashing |
| **Spoofing** | JWT forgery | HS256 with 32+ char secrets, issuer/audience validation |
| **Tampering** | Refresh token replay | Family-based rotation, reuse detection, atomic transactions |
| **Tampering** | Role self-assignment | Register schema restricts to STUDENT only |
| **Repudiation** | Denial of actions | Append-only audit log for auth and admin operations |
| **Information disclosure** | User enumeration | Generic error messages on login/register |
| **Information disclosure** | IDOR / resource enumeration | Ownership middleware, 404 on unauthorized access |
| **Denial of service** | Large payload attacks | 10 KB JSON body limit |
| **Elevation of privilege** | RBAC bypass | Deny-by-default `requireRole`, middleware on all protected routes |
| **Elevation of privilege** | Admin impersonation | Role verified from signed JWT, not client-supplied body |

---

## Security testing

### Test organization

| File | Coverage |
|---|---|
| `server/tests/unit/auth.test.ts` | Registration, login, refresh rotation, logout, token replay, concurrent sessions |
| `server/tests/unit/rbac.test.ts` | Role enforcement, missing/invalid tokens, permission denial logging |
| `server/tests/unit/idor.test.ts` | Ownership middleware for lesson, module, certificate resources |
| `server/tests/integration/security.test.ts` | Helmet headers, payload limits, audit immutability, admin audit events |
| `server/tests/helpers/security.helper.ts` | Reusable token manipulation and IDOR test utilities |

### Running tests

```bash
cd server
DATABASE_URL=postgresql://postgres:password@localhost:5432/secure_lms_test \
NODE_ENV=test \
JWT_ACCESS_SECRET=<32+ chars> \
JWT_REFRESH_SECRET=<32+ chars> \
npm test
```

The test database name must end in `test` — the test setup refuses to run destructive cleanup against non-test databases (SEC-002).

### Vulnerability register

All findings are tracked in [`VULNERABILITY_REGISTER.md`](./VULNERABILITY_REGISTER.md).

---

## Related documents

- Architecture overview: [`docs/architecture/README.md`](../architecture/README.md)
- API contract: [`docs/api/openapi.yaml`](../api/openapi.yaml)
- Contributing / review requirements: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Database schema: [`server/prisma/schema.prisma`](../../server/prisma/schema.prisma)
