# Audit Logging & Traceability — Secure LMS

This document details the append-only audit logging mechanism used to capture security-relevant events across the application lifecycle.

---

## 1. Immutable Audit Trail
Secure LMS logs critical operational and security actions to a dedicated `AuditEvent` database table. To enforce strict immutability at the schema level, the `AuditEvent` model intentionally omits an `updatedAt` field, and the application layer exposes zero `UPDATE` or `DELETE` API endpoints for these records. Logs are append-only and visible strictly via the Admin Portal dashboard.

## 2. Captured Event Types
The system automatically generates database audit trails for high-value state changes, including:
* **Authentication:** `auth.register`, `auth.login_success`, `auth.login_failed`, `auth.logout`, `auth.token_refresh`, and `auth.refresh_token_reuse_detected`.
* **Commerce & Payments:** `purchase.initialized` and `purchase.completed` (verified via Paystack server-to-server webhooks).
* **Administration & Profiles:** `user.profile_updated`, `admin.user_deactivated`, `admin.user_activated`, and `admin.user_password_reset`.

## 3. DoS Protection & High-Volume Logging
To protect the database from Denial of Service (DoS) attacks, high-volume security rejections—such as repeated `403 Forbidden` authorization denials (`auth.permission_denied`)—are intentionally *not* written to the database. Instead, they are emitted as structured JSON to standard output (`stdout`) for monitoring and ingestion by external SIEM or log aggregation tools.

## 4. Privacy & Data Masking
Audit records capture operational metadata, timestamps, IP context, and user identifiers while strictly omitting sensitive credentials, password hashes, and raw JWT tokens to comply with data protection and privacy standards.