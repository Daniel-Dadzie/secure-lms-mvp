# Payment Security & Webhook Integrity — Secure LMS

This document outlines the security controls, transactional guarantees, and error-handling strategies governing financial transactions within Secure LMS.

---

## 1. Gateway Integration & Architecture Pivot
* **Gateway:** The platform integrates **Paystack** for secure checkout and currency processing.
* **Design Pivot Note:** The platform utilizes Paystack for reliable localized and international payment routing, supporting seamless checkout processing.

## 2. Transactional Workflow & State Enforcement
* **Pending States:** Checkout initialization creates a purchase record marked strictly as `PENDING`. No course enrollment or lesson access is granted at checkout initialization.
* **Server-to-Server Verification:** Course enrollment is deferred until the payment provider confirms the transaction via verified server callbacks or webhooks.

## 3. Webhook Signature Validation & Idempotency
* **HMAC Verification:** All incoming Paystack webhooks are verified using cryptographic signature headers (`x-paystack-signature`) via HMAC SHA512 to reject forged or unauthenticated requests.
* **Idempotent Processing:** Webhook handlers check purchase states before execution. If a webhook event arrives twice (due to network retries), the system processes it idempotently without creating duplicate enrollments or audit logs.
* **Atomicity:** Database operations spanning purchase completion, enrollment generation, lesson progress initialization, and audit logging are wrapped inside atomic **Prisma transactions**.