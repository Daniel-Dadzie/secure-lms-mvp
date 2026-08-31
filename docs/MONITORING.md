# Production Monitoring & Observability Plan — Secure LMS

This document details the production monitoring strategy designed to ensure operational reliability, performance tracking, and rapid incident response for the Secure LMS platform.

---

## 1. Monitoring Pillars

### A. Application Metrics
* **HTTP Traffic & Error Rates:** Track request volumes, response latency percentiles (p95, p99), and HTTP status code distribution (monitoring spikes in `4xx` client errors and `5xx` server faults).
* **Authentication & Authorization Health:** Monitor rates of successful logins, failed authentication attempts, and authorization violations (`403 Forbidden` responses).
* **Payment Gateway Signals:** Track successful checkout completions, pending transaction states, webhook processing failures, and signature mismatch errors.

### B. Infrastructure & Container Health
* **Host Resource Utilization:** Continuous tracking of CPU load, memory consumption, disk I/O, and storage capacity on the EC2 host.
* **Container Orchestration:** PM2 process metrics and Docker container health check statuses.
* **Database Performance:** PostgreSQL connection pool saturation, slow query execution times, and deadlocks.

### C. Security Signals & SIEM Integration
* **Credential Stuffing Detection:** Alerts triggered by sudden spikes in failed login attempts from specific IP addresses.
* **Token Reuse Alerts:** Immediate notification when a revoked refresh token is re-submitted, signaling a potential token-theft attempt.
* **Administrative Actions:** Real-time logging and alerting for privilege modifications, user deletions, and course override operations.

---

## 2. Tooling & Incident Response Pipeline
* **Log Collection:** Structured JSON application logs piped to file handlers and managed log aggregation tools.
* **Alerting Thresholds:** Automated alerts configured for sustained error rates exceeding 2% over a 5-minute window or database connection exhaustion.