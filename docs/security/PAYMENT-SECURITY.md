# Payment Security & Webhook Integrity — Secure LMS

This document outlines the security controls, transactional guarantees, and error-handling strategies governing financial transactions within Secure LMS.

---

## 1. Gateway Integration & Architecture Pivot
* **Gateway:** The platform integrates **Stripe** for secure checkout and global currency processing. 
* **Design Pivot Note:** The platform was migrated from Paystack to Stripe due to infrastructure requirements and billing test flexibility.


## 2. Transactional Workflow & State Enforcement
* **Pending States:** Checkout initialization creates a purchase record marked strictly as `PENDING`. No course enrollment or lesson access is granted at checkout initialization.
* **Server-to-Server Verification:** Course enrollment is deferred until the payment provider confirms the transaction via verified server callbacks or webhooks.


## 3. Webhook Signature Validation & Idempotency
* **HMAC Verification:** All incoming Stripe webhooks are verified using cryptographic signature headers (`stripe-signature`) to reject forged or unauthenticated requests.
* **Idempotent Processing:** Webhook handlers check purchase states before execution. If a webhook event arrives twice (due to network retries), the system processes it idempotently without creating duplicate enrollments or audit logs.
* **Atomicity:** Database operations spanning purchase completion, enrollment generation, lesson progress initialization, and audit logging are wrapped inside atomic **Prisma transactions**.