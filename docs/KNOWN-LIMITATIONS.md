# Known Limitations — Secure LMS MVP

To provide complete transparency to evaluators and security reviewers, this document details the known technical limitations, boundary conditions, and planned mitigations of the current MVP implementation.

---

## 1. Access Token Revocation Window
* **Limitation:** Because stateless JWT access tokens are valid for 15 minutes, an issued access token remains active until its expiration even if a user's session is terminated or their role changes, unless checked against a server-side denylist.
* **Mitigation:** Refresh tokens are aggressively tracked, hashed, and subjected to token-family rotation. If a refresh token is compromised or reused, the entire session family is instantly invalidated, limiting exposure time.

## 2. Infrastructure Availability & Topology
* **Limitation:** The current deployment runs on a single AWS EC2 instance. A complete underlying host outage would result in temporary service downtime.
* **Mitigation:** The application state is fully decoupled from ephemeral container storage, allowing rapid redeployment via Docker Compose or automated CI/CD pipelines.

## 3. Payment Dispute & Automated Reconciliation
* **Limitation:** While webhook signature verification and idempotency protect against double enrollments and failed state injections, automated background reconciliation for edge cases like bank chargebacks requires manual administrative review.
* **Mitigation:** All payment events generate structured audit records (`purchase.completed`) to assist manual accounting verification.

## 4. Distributed Rate Limiting
* **Limitation:** Rate limiting (`express-rate-limit`) currently relies on local in-memory storage per application process instance.
* **Mitigation:** For multi-instance horizontal scaling, the rate-limiting store will be migrated to a shared Redis cluster.

---

## 5. Architectural Pivots & Design Rationale

* **Payment Gateway Integration (Paystack):**
  * **Context & Rationale:** The platform's transactional model is built around Paystack checkout and HMAC SHA-512 webhook verification. This architecture ensures robust localized and international payment routing, secure server-to-server signature validation, and clean idempotency handling for test and production environments. 
* **Media & Video Storage Pivot (Firebase to Cloudinary):**
  * **Context & Rationale:** Although Firebase was initially considered for backend utilities, media storage and video streaming were migrated to Cloudinary. This decision was driven by Firebase’s strict tier limits and premium access barriers for media hosting. Cloudinary provides dedicated signed URL generation, optimized video delivery, and secure cloud storage management for course assets without encountering unexpected quota locks during evaluation.