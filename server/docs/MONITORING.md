Monitoring & Observability — MVP and Production Plan
This document distinguishes the monitoring capabilities currently available in the Secure LMS MVP from the observability enhancements planned for production.
---
1. MVP Monitoring
The current deployment provides practical application, security and infrastructure visibility through structured logs, audit records and container/host health monitoring.
Application & Security Events
The backend produces structured security/application events including:
`auth.login_success`
`auth.login_failed`
`auth.logout`
`auth.permission_denied`
Refresh-token security events
Payment/webhook events
Administrative activity
For example, an unauthorized Student request to an Admin-only endpoint generates an `auth.permission_denied` warning containing relevant request and authorization context.
Audit Logging
Security-sensitive events are persisted in the application's audit-log system.
Recorded information may include:
Event type
Timestamp
User/entity identity
Source IP
Relevant action metadata
This provides an auditable trail for authentication, authorization and administrative activity.
---
2. Container & Database Health
The production Docker Compose deployment provides:
Container status visibility
`restart: unless-stopped` policies
PostgreSQL readiness healthcheck
Service dependency checks
Container resource visibility
PostgreSQL uses `pg_isready` to verify database readiness before dependent services start.
---
3. Host & Infrastructure Visibility
The MVP deployment runs on AWS EC2.
Operational visibility includes:
CPU utilization
Memory usage
Disk/storage capacity
Network activity
Container status
Container resource consumption
AWS/EC2 metrics and Docker/Linux tools provide the current operational monitoring foundation.
---
4. Payment Monitoring
Payment activity is observable through application logs and audit events.
Important states and events include:
```text
Checkout Initiated
       ↓
PENDING
       ↓
Server-side Verification
       ↓
Webhook Validation
       ↓
Payment Completed
       ↓
Enrollment
```
Webhook requests are validated server-side before payment completion is trusted.
Invalid signatures, unsuccessful transactions and unexpected payment states must not result in unauthorized enrollment.
---
5. MVP Scope
The MVP intentionally provides operational visibility rather than a centralized observability platform.
Implemented / Available
Structured backend logs
Security-event logging
Database-backed audit logs
Docker container monitoring
PostgreSQL healthchecks
EC2 operational metrics
Manual log/resource investigation
Not Currently Deployed
Centralized APM
Centralized SIEM
Distributed metrics platform
Automated incident alerting
Advanced observability dashboards
---
6. Production Observability Roadmap
The production architecture will extend the MVP foundation with:
Amazon CloudWatch
For:
EC2 infrastructure metrics
Centralized log collection
Infrastructure alarms
AWS service visibility
Prometheus
For:
Application metrics
Container/infrastructure metrics
Request rates
Error rates
Latency
Custom LMS security and business metrics
Grafana
For unified dashboards covering:
Application performance
Infrastructure health
Database health
Security events
Payment activity
---
7. Production Metrics
The production observability stack will monitor:
Application
Request rate
p50/p95/p99 latency
4xx/5xx error rates
Application exceptions
Dependency health
Service availability
Infrastructure
CPU and memory utilization
Disk/storage capacity
Network activity
Container health
Load-balancer health
Scaling signals
Database
Connection utilization
Query latency
Slow queries
Deadlocks
Storage growth
Availability health
Security
Failed authentication attempts
Authorization violations
Refresh-token reuse
Privilege changes
Administrative activity
Abnormal authentication patterns
Payments
Pending transactions
Verification failures
Webhook failures
Signature mismatches
Duplicate/replayed events
Unexpected payment states
---
8. Alerting & Incident Response
Production alerting will be configured for critical operational and security conditions, including:
Sustained 5xx error rates
Significant latency increases
Database connection exhaustion
Container/service failures
Storage exhaustion
Authentication anomalies
Token-reuse events
Payment/webhook failures
The intended incident-response flow is:
Detect → Alert → Investigate → Contain → Recover → Review
---
9. Observability Architecture
The planned production architecture is:
```text
                  Secure LMS
                      │
        ┌─────────────┴─────────────┐
        │                           │
   Application Logs             Metrics
        │                           │
        ▼                           ▼
   CloudWatch                  Prometheus
        │                           │
        │                        Grafana
        │                           │
        └─────────────┬─────────────┘
                      ▼
             Dashboards & Alerts
                      │
                      ▼
              Incident Response
```
CloudWatch, Prometheus and Grafana are production roadmap components, not claims of current MVP deployment.
---
10. MVP → Production
Capability	MVP	Production
Application logs	Structured JSON	Centralized aggregation
Audit logs	Database-backed	Centralized/tamper-evident
Container health	Docker	Centralized monitoring
Database health	PostgreSQL healthcheck	Advanced DB monitoring
EC2 monitoring	AWS/OS visibility	CloudWatch
Metrics	Basic/manual	Prometheus
Dashboards	Application/Admin views	Grafana
Alerting	Manual investigation	Automated
APM	Not deployed	Planned
SIEM	Not deployed	Planned
---
Conclusion
Secure LMS currently provides a credible MVP monitoring foundation through structured application logging, security audit records, Docker health monitoring, PostgreSQL readiness checks and EC2 operational visibility.
The production roadmap builds on this foundation with Amazon CloudWatch, Prometheus and Grafana, together with centralized logging, automated alerting, APM and SIEM integration.
This separation ensures that the platform's current capabilities are accurately represented while providing a clear and practical path toward production-grade observability.