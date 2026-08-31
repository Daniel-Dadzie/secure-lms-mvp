# Content Authorization & Gating Strategy — Secure LMS

This document explains how Secure LMS protects paid course materials from unauthorized access and enforces strict server-side authorization boundaries.

---

## 1. Defense-in-Depth Authorization
Hiding UI components on the frontend is insufficient for a secure platform. Secure LMS enforces content gating at the **API and database layer**, ensuring that protected data is never transmitted to the client without verified authorization.

## 2. Enrollment Verification Middleware
* **The Rule:** Before returning protected course modules, text lessons, or video stream URLs, the Express backend verifies whether the authenticated user has an active, verified `Enrolment` record for that specific course.
* **Regression Protection:** This architecture prevents direct URL manipulation or API scraping (addressing past vulnerability regressions like SEC-015). Unauthenticated or unenrolled requests receive an immediate `403 Forbidden` error.

## 3. Media Asset Protection (Cloudinary)
* **Secure Delivery:** Course videos and premium media are hosted via Cloudinary. Instead of exposing raw, static public URLs, the backend generates dynamically signed, time-limited access URLs.
* **Asset Gating:** These signed URLs are only generated and delivered to the client *after* the enrollment verification middleware confirms the user's access rights, preventing hotlinking and unauthorized media downloads.

## 4. Ownership & Role Controls
* **Instructors:** Can only manage, edit, or view analytics for courses where they are explicitly assigned as the creator/owner (`instructorId`). Attempting to access another instructor's course yields a `404 Not Found` to prevent resource enumeration.
* **Admins:** Have platform-wide oversight and bypass capabilities, but are bound by strict, immutable audit logging for any administrative overrides or data access.