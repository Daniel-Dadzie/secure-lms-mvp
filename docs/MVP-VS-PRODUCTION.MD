# MVP vs. Production Roadmap — Secure LMS

This document outlines the explicit architectural and security scope boundaries between our current **Minimum Viable Product (MVP)** implementation and our target **Enterprise Production** roadmap.

---

## Architecture & Scope Comparison

| Evaluation Area | Current MVP Implementation | Enterprise Production Roadmap |
| :--- | :--- | :--- |
| **Hosting & Infrastructure** | Single AWS EC2 instance running Docker Compose (Nginx, Node.js, PostgreSQL). | Multi-region AWS ECS/EKS container orchestration with automated horizontal scaling. |
| **Database Topology** | Single-node PostgreSQL instance with automated local backups. | Managed Multi-AZ PostgreSQL (AWS RDS) with read replicas and automated point-in-time recovery. |
| **Authentication & Sessions** | JWT Access Tokens (15m) + Server-tracked SHA-256 hashed Refresh Tokens (7d). | Centralized Identity Provider / Enterprise Single Sign-On (OIDC/SAML, Keycloak or Auth0). |
| **Authorization Controls** | Role-Based Access Control (RBAC) + Resource Ownership Middleware. | Fine-Grained Attribute-Based Access Control (ABAC) and dynamic policy engines. |
| **Secret Management** | Local environment files (`.env`) validated via strict schema parsing. | AWS Secrets Manager / HashiCorp Vault with automated secret rotation. |
| **Observability & Monitoring** | Structured console application logs and PM2 process monitoring. | Centralized APM and SIEM pipelines (AWS CloudWatch, Datadog, Prometheus/Grafana). |
| **Payment Integration** | Stripe Checkout integration with HMAC webhook signature verification. | Multi-gateway orchestration (Stripe + regional alternatives) with automated ledger reconciliation. |
| **Audit Logging** | Append-only database `AuditEvent` table viewed via the Admin Portal. | Immutable, tamper-evident centralized log streaming to write-once-read-many (WORM) storage. |

---

## Strategic Design Rationale

We deliberately scoped complex distributed features (such as multi-region failover and Kubernetes orchestration) out of the MVP to focus heavily on **application-layer security, data integrity, and role boundaries**. This ensures a highly stable, auditable core platform that can be cleanly scaled into an enterprise environment.