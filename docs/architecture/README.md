# System Architecture

This directory documents the high-level architecture for the Secure LMS MVP.

## Diagram

`system-overview.png` — save the architecture diagram here (generated in team discussion, screenshot/exported from the visual reference shared with the team).

## Overview

The system is split into three trust zones:

1. **Untrusted Zone — Client (Next.js)**
   Runs in the user's browser. Nothing originating here is trusted by default —
   all input is re-validated server-side regardless of any client-side checks.

2. **Application Zone — Server (Node.js / Express)**
   The trust boundary begins at the middleware layer (auth verification, RBAC,
   rate limiting, input validation). Once a request passes middleware, it's
   routed to the relevant domain module (`auth`, `courses`, `enrolments`,
   `payments`, `support`, `admin`, `notifications`). Every module that changes
   state writes an `AuditEvent` — this is a cross-cutting requirement, not
   optional per-module behavior.

3. **Data / External Zone — PostgreSQL + Firebase**
   - **PostgreSQL** is the single source of truth for all transactional data
     (users, courses, enrolments, purchases, progress, audit log). Accessed
     exclusively through Prisma ORM via one shared client instance.
   - **Firebase Storage** holds course thumbnails and lesson media. Postgres
     never stores file bytes — only Firebase URL references. This is a
     deliberate boundary between the transactional store and the blob store.
   - **Firebase Cloud Messaging** handles push notifications, triggered by the
     `notifications` module on domain events (enrolment confirmation, new
     lesson published, etc.).

## Key architectural decisions

- **Modular monolith, not microservices.** Domain modules are folder-isolated
  (`server/src/modules/*`) so they could be extracted into separate services
  later if needed, without paying microservice complexity costs during MVP
  development.
- **Auth and RBAC live natively in the Node/Postgres layer** (JWT + bcrypt),
  not in Firebase Auth — keeps the security-sensitive auth logic fully owned
  and reviewable by the team, satisfying the brief's emphasis on
  password hashing and secure session handling being demonstrably ours.
- **Role is a denormalized enum on `User`**, not a joined `Role` table — RBAC
  checks run on nearly every authenticated request, so avoiding a join on
  that hot path was a deliberate performance trade-off for MVP scale.
- **`AuditEvent` is append-only by design** — no `updatedAt` field exists on
  the model, and the application layer must never expose update/delete on
  this table.

## Related documents

- Database schema: `server/prisma/schema.prisma`
- Entity relationship diagram: see schema comments / ERD shared with team
- API contract: `docs/api/openapi.yaml`
- Security requirements: `docs/SECURITY.md` (cybersecurity team)