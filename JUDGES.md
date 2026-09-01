# Secure LMS — Judge Verification Guide

**Mech Spec Technologies | Secure LMS MVP**

Welcome to the Secure LMS evaluation guide. This document provides the live demo, test credentials and a concise path for independently verifying the platform's core security controls.

> **MVP Transparency:** Capabilities marked as production roadmap items are not represented as currently deployed.

---

## 1. Live Application

* **Frontend:** http://54.229.212.77/
* **API:** http://54.229.212.77/api
* **API Documentation:** http://54.229.212.77/api/docs

---

## 2. Test Accounts

| Role              | Email                      | Password       |
| ----------------- | -------------------------- | -------------- |
| **Student**       | `student@mechlms.com`      | `Password123!` |
| **Instructor**    | `james.walker@mechlms.com` | `Password123!` |
| **Administrator** | `admin@mechlms.com`        | `Password123!` |

These accounts are provided solely for evaluation.

---

## 3. Five-Minute Security Verification

### 1. Authentication & Session Security

**Verify:** JWT authentication and refresh-token protection.

* Access token lifetime: **15 minutes**
* Refresh token lifetime: **7 days**
* Refresh tokens are SHA-256 hashed before storage.
* Refresh-token rotation and token-family reuse detection are implemented.

---

### 2. Role-Based Access Control (RBAC)

**Verify:** Administrative APIs cannot be accessed by Students.

**Test:**

1. Sign in as the **Student**.
2. Request:

```text
GET /api/users/admin/users
```

3. Observe the response.

**Expected:** `403 Forbidden`.

Repeat the request as **Administrator**.

**Expected:** The authorized administrative response is returned.

**Security evidence:** The endpoint requires authentication and the `ADMIN` role at the backend API layer.

---

### 3. Content Gating

**Verify:** Protected course content is not exposed to unenrolled students.

**Test:**

1. Sign in as the **Student**.
2. Open a paid course and select a lesson.
3. Inspect:

```text
GET /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
```

**Expected when unenrolled:**

* Lesson metadata may be returned.
* `contentUrl` is not exposed (`null`).
* Protected video content cannot be accessed.

After verified enrollment, repeat the request.

**Expected:** Authorized lesson content becomes available.

---

### 4. Protected Video Streaming

The lesson stream endpoint requires a valid signed stream token.

**Expected:**

* Missing token → `401 Unauthorized`
* Invalid token → `403 Forbidden`
* Valid authorized token → protected stream access

This provides an additional layer of protection beyond frontend content gating.

---

### 5. Audit Logging & Security Monitoring

**Verify:** Security-sensitive events are recorded and attributable.

1. Perform a successful login.
2. Perform an unsuccessful login.
3. Log out.
4. As Administrator, open **Audit Logs**.

**Expected events include:**

```text
Auth Login Success
Auth Login Failed
Auth Logout
```

Audit records include timestamp, user identity, event type and source IP where available.

RBAC violations also generate structured backend events such as:

```text
auth.permission_denied
```

---

### 6. Payment Integrity

**Provider:** Paystack

The payment workflow is designed so that browser-side success alone does not grant course access.

```text
Checkout
   ↓
PENDING
   ↓
Server-side verification
   ↓
Webhook signature validation
   ↓
Payment completion
   ↓
Enrollment
```

**Expected:** Invalid signatures, failed verification or unsuccessful payment states do not grant enrollment.

---

## 4. Token Revocation Strategy

Secure LMS uses short-lived access tokens together with server-tracked refresh tokens.

* Access tokens expire after **15 minutes**.
* Refresh tokens are rotated on use.
* Refresh-token reuse triggers token-family revocation.
* Reuse detection is recorded as a security event.
* An already-issued access token may remain valid until expiry.

**MVP limitation:** Immediate revocation of an active access token is therefore bounded by its 15-minute lifetime.

**Production roadmap:** Distributed access-token revocation/denylisting.

---

## 5. Monitoring & Observability

The MVP provides operational and security visibility through:

* Structured backend application logs
* Database-backed audit logs
* Docker container status/resource visibility
* PostgreSQL readiness healthchecks
* EC2 operational metrics

Verified security events include authentication activity and `auth.permission_denied` RBAC violations.

**Production roadmap:** Amazon CloudWatch, Prometheus, Grafana, centralized logging, APM, SIEM integration and automated alerting.

See `server/docs/MONITORING.md`.

---

## 6. MVP vs Production

| Current MVP                  | Production Roadmap                           |
| ---------------------------- | -------------------------------------------- |
| Single EC2 deployment        | Highly available multi-instance architecture |
| Docker Compose               | ECS/EKS                                      |
| PostgreSQL                   | Managed Multi-AZ database                    |
| JWT + refresh-token rotation | Distributed revocation controls              |
| Database audit logs          | Centralized/tamper-evident logging           |
| Basic operational visibility | CloudWatch + Prometheus + Grafana            |
| Paystack integration         | Automated reconciliation/dispute workflows   |
| Manual investigation         | Automated alerting and incident response     |

---

## 7. Known Limitations

The current MVP intentionally has the following boundaries:

* Active access-token revocation is bounded by the 15-minute token lifetime.
* Deployment currently uses a single EC2 host.
* Centralized APM/SIEM and automated alerting are not yet deployed.
* Distributed rate limiting is planned for horizontal scaling.
* Automated payment dispute/chargeback reconciliation is not yet implemented.
* Full automated disaster-recovery verification is planned for production.

---

## 8. Verification Summary

Secure LMS demonstrates a security-first LMS architecture built around:

**Authentication → RBAC → Content Protection → Secure Payments → Auditability**

The MVP is intentionally distinguished from the production roadmap so judges can independently verify implemented controls while clearly understanding the remaining path to production readiness.

### Key implementation evidence

* `server/src/modules/auth/`
* `server/src/modules/users/users.routes.ts`
* `server/src/modules/courses/lessons.service.ts`
* `server/src/modules/courses/lessons.controller.ts`
* `server/src/modules/payments/`
* `server/docs/MONITORING.md`
* `server/docs/MVP-VS-PRODUCTION.md`
* `server/docs/KNOWN-LIMITATIONS.md`
