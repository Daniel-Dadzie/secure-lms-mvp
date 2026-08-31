# Token Management & Session Security — Secure LMS

This document details the token-based authentication, rotation, and revocation mechanisms implemented to secure user sessions in the Secure LMS platform.

---

## 1. Token Lifespan & Storage Strategy
* **Access Tokens:** Configured with a short lifespan of **15 minutes**. These are kept strictly in memory on the client side (never written to `localStorage` or `sessionStorage` to mitigate Cross-Site Scripting [XSS] exfiltration).
* **Refresh Tokens:** Configured with a 7-day lifespan. They are transmitted using secure, HTTP-only cookies (`httpOnly`, `secure`, and `sameSite` configuration) to prevent client-side script access and mitigate Cross-Site Request Forgery (CSRF).

## 2. Secure Storage & Hashing
To prevent database compromise from exposing active refresh tokens, raw refresh tokens are never stored in plaintext. The database saves only their **SHA-256 cryptographic hashes**.

## 3. Token-Family Rotation & Replay Detection
* **Rotation on Use:** Every time a refresh token is exchanged for a new access token, the old refresh token is invalidated, and a new token family member is issued.
* **Atomicity:** Token rotation is wrapped in atomic database transactions (`Prisma.$transaction`) to prevent race conditions or orphaned tokens if a network failure occurs during the exchange. 
* **Replay Attack Defense:** If a previously revoked or rotated refresh token is re-submitted (signaling potential theft or token interception), the backend detects the anomaly, immediately revokes the **entire token family**, and terminates all active sessions associated with that user profile.

## 4. Logout Invalidation
When a user logs out, the backend explicitly clears the authentication cookies and invalidates the active refresh token family based on the family lineage identifier, ensuring immediate and complete session termination across all devices.