# Security Verification Matrix — Secure LMS

This verification matrix provides reproducible test cases for evaluating the core security controls implemented in the Secure LMS platform.

---

## Test Cases

| Test ID | Security Control | Objective | Steps to Verify | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-001** | **Authentication** | Verify short-lived tokens and secure session cookies. | Log in using `student@mechspec.test`. Inspect application storage and network headers. | Access tokens reside strictly in memory; refresh tokens are stored in secure, HTTP-only cookies. |
| **TEST-002** | **RBAC Enforcement** | Prove backend role restrictions. | Log in as a Student and attempt to access admin API routes or pages. | Backend returns `403 Forbidden`; access is strictly blocked. |
| **TEST-003** | **Content Gating** | Verify paid course protection. | Attempt to fetch protected lesson content for an unpurchased course. | Backend rejects the request with an authorization error until enrollment is verified. |
| **TEST-004** | **Audit Logging** | Confirm security event tracking. | Perform a login action, then log in as Admin and view Audit Logs. | Event `auth.login_success` is logged with timestamp and user metadata. |
| **TEST-005** | **Webhook Security** | Ensure payment authenticity. | Send a simulated Stripe webhook request with an invalid or missing signature header. | Server rejects the request with a `401 Unauthorized` status. |
| **TEST-006** | **Token Rotation** | Prevent token replay attacks. | Re-use an already rotated refresh token. | System detects reuse, revokes the entire token family, and terminates the session. |