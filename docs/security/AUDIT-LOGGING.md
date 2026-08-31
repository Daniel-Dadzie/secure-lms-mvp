# Audit Logging & Traceability — Secure LMS

This document details the append-only audit logging mechanism used to capture security-relevant events across the application lifecycle.

---

## 1. Immutable Audit Trail
Secure LMS logs critical operational and security actions to a dedicated `AuditEvent` database table. These logs are append-only and visible via the Admin Portal dashboard.

## 2. Captured Event Types
The system automatically generates audit trails for:
* **Authentication:** `auth.register`, `auth.login_success`, `auth.login_failed`, `auth.logout`, `auth.refresh_token_reuse_detected`
* **Commerce & Payments:** `purchase.completed`, webhook verification events
* **Administration:** User status modifications, role changes, and system configuration updates

## 3. Privacy & Data Masking
Audit records capture operational metadata, timestamps, and user identifiers while strictly omitting sensitive credentials, passwords, and raw JWT tokens to comply with data protection standards.