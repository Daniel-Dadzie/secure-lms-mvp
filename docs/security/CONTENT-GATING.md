# Content Authorization & Gating Strategy — Secure LMS

This document explains how Secure LMS protects paid course materials from unauthorized access and enforces strict server-side authorization boundaries.

---

## 1. Defense-in-Depth Authorization
Hiding UI components on the frontend is insufficient for a secure platform. Secure LMS enforces content gating at the **API and database layer**.

## 2. Enrollment Verification Middleware
* **The Rule:** Before returning protected course modules, text lessons, or video streams, the Express backend verifies whether the authenticated user has an active, verified `Enrolment` record for that specific course.
* **Regression Protection:** This architecture prevents direct URL manipulation or API scraping (addressing past vulnerability regressions like SEC-015). Unauthenticated or unenrolled requests receive an immediate `403 Forbidden` error.

## 3. Ownership & Role Controls
* **Instructors:** Can only manage, edit, or view analytics for courses where they are assigned as the creator/owner.
* **Admins:** Have platform-wide oversight but are bound by strict audit logging for any administrative overrides.