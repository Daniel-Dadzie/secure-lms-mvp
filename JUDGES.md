any updates to be done in  this files as well

# Secure LMS — Judge & Evaluator Guide

Welcome to the evaluation guide for **Mech Spec Technologies (Secure LMS Platform)**. This document provides direct live links, safe test credentials, a 5-minute verification path, and explicit instructions to independently verify our platform's security controls, role-based access control (RBAC), content gating, audit logs, and payment processing.

---

## 1. Live Application & Access

* **Live Frontend URL:** [http://54.229.212.77/](http://54.229.212.77/)
* **Backend API Base:** [http://54.229.212.77/api](http://54.229.212.77/api)
* **API Documentation:** [http://54.229.212.77/api-docs](http://54.229.212.77/api/docs)

---

## 2. Safe Test Accounts

Use these pre-provisioned roles to test authentication, permissions, and administrative features (all accounts use the password: `Password123!`):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Student** | `student@mechlms.com` | `Password123!` | Standard enrolled/unenrolled student features |
| **Instructor** | `james.walker@mechlms.com` | `Password123!` | Course management and analytics |
| **Administrator** | `admin@mechlms.com` | `Password123!` | System settings, audit logs, and user management |

---

## 3. 5-Minute Security Verification Path

### Test 1 — Authentication & Token Rotation
* **Objective:** Verify short-lived access tokens and secure refresh-token handling.
* **Steps:** Log in as a student. Open browser developer tools (`F12` > Application/Storage > Cookies). Verify that the access token is kept in memory while the refresh token is securely stored in an HTTP-only, secure cookie. 

### Test 2 — Role-Based Access Control (RBAC)
* **Objective:** Prove that API routes strictly enforce role boundaries.
* **Steps:** Log in using the **Student** account. Attempt to navigate directly to `/admin` or invoke an administrative API endpoint. 
* **Expected Result:** The backend immediately denies access with a `403 Forbidden` response, preventing unauthorized privilege escalation.

### Test 3 — Content Gating
* **Objective:** Ensure paid course content cannot be accessed without verified enrollment.
* **Steps:** Log in as an **unenrolled Student**. Attempt to access protected lesson material for a paid course.
* **Expected Result:** Access is denied by the backend authorization middleware. After completing a test purchase/enrollment, the same lesson content becomes immediately available.

### Test 4 — Audit Logging
* **Objective:** Verify that security-sensitive actions generate a permanent audit trail.
* **Steps:** Log in, perform a test action (or trigger a login failure), and then log in as the **Administrator**. Navigate to the Admin Audit Logs dashboard.
* **Expected Result:** Traceable audit events (`auth.login_success`, `auth.login_failed`, `purchase.completed`) are recorded with timestamps and metadata.

### Test 5 — Payment Integrity & Webhook Security
* **Objective:** Prove that purchases require cryptographic verification and backend confirmation.
* **Steps:** Initiate a checkout flow for a course. 
* **Expected Result:** The purchase is marked as `PENDING`. Enrollment is withheld until Stripe verifies the transaction server-to-server and the backend validates the `stripe-signature` webhook header.

---

## 4. Demo Timestamps

* **00:00 – 01:00** | System Context & Architecture Overview
* **01:00 – 02:00** | Authentication & RBAC Demonstration (`403 Forbidden` enforcement)
* **02:00 – 03:00** | Content Gating & Course Enrollment Workflow
* **03:00 – 04:00** | Payment Processing, Webhook Security & Idempotency
* **04:00 – 05:00** | Admin Audit Trail & Security Event Verification

---

## 5. Summary of Core Security Controls

* **RBAC & Authorization:** Strict middleware validation enforcing user roles and resource ownership across all API controllers.
* **JWT & Refresh Tokens:** 15-minute access token lifespans paired with 7-day server-tracked, SHA-256 hashed refresh tokens.
* **Token-Family Rotation:** Automatic detection of refresh token reuse revokes the entire token family to mitigate replay attacks.
* **Transactional Payments:** Prisma database transactions ensure that purchases, enrollments, and audit logs update atomically.

---

## 6. MVP vs. Production Roadmap

* **MVP Scope:** Single-region EC2 Docker deployment, PostgreSQL database, JWT + refresh token rotation, Stripe payments, and database-level audit logging.
* **Production Roadmap:** Multi-region high availability (ECS/EKS), AWS Secrets Manager, managed Redis session stores, and centralized SIEM log pipelines. (See `docs/MVP-VS-PRODUCTION.md`).

---

## 7. Known Limitations & Architectural Pivots

* **Access Token Revocation:** Immediate revocation of an active access token is bounded by its short 15-minute expiration window unless a secondary distributed denylist is checked.
* **Payment Gateway Pivot:** Migrated from Paystack to Stripe to optimize global test card processing and secure webhook signature verification.
* **Media Storage Pivot:** Migrated from Firebase to Cloudinary due to free-tier media streaming limits and premium access barriers.
* **Disaster Recovery:** Automated point-in-time recovery verification is planned for the post-MVP production release. (See `docs/KNOWN-LIMITATIONS.md`).