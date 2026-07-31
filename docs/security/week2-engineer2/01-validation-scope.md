# Week 2 Cybersecurity Validation Scope

## Project Information

- **Project:** Secure LMS MVP
- **Repository:** Daniel-Dadzie/secure-lms-mvp
- **Validation Role:** Cybersecurity Engineer 2 — Security Testing and Validation
- **Validation Branch:** `security/week2-engineer2-validation`
- **Validation Phase:** Week 2
- **Document Purpose:** Define the scope, methodology, evidence requirements and acceptance criteria for independent Week 2 cybersecurity validation.

---

## 1. Validation Objective

The objective of this validation exercise is to independently verify that the security controls implemented during Week 2 operate as intended and adequately protect the Secure LMS MVP against authentication, authorization, session-management, resource-ownership, API and business-logic security threats.

This validation will determine whether:

- Authentication workflows operate securely.
- JWT access tokens are correctly issued and validated.
- Refresh-token rotation and revocation work correctly.
- Session expiration, logout and revocation are enforced.
- Role-based access control prevents unauthorized access.
- Protected resources enforce authentication, role and ownership checks.
- IDOR and privilege-escalation attacks are prevented.
- Security-sensitive events generate accurate audit records.
- API security and HTTP-hardening controls are operational.
- DevSecOps tools and GitHub workflows execute successfully.
- Previously identified vulnerabilities have been remediated and independently retested.
- Week 2 cybersecurity deliverables are ready for formal sign-off.

---

## 2. Validation Scope

### 2.1 Authentication and Session Security

The following authentication controls will be tested:

- Student registration.
- Rejection of public Administrator role self-assignment.
- Rejection of public Instructor role self-assignment.
- Password validation and secure password hashing.
- Valid login.
- Invalid-password handling.
- Unknown-user login handling.
- Logout.
- JWT signature validation.
- JWT issuer and audience validation.
- Expired access tokens.
- Invalid and malformed access tokens.
- Refresh-token rotation.
- Refresh-token replay detection.
- Expired refresh tokens.
- Refresh-token family revocation.
- Session expiration.
- Session revocation following account suspension.
- Session revocation following administrative password reset.
- Refresh-token cookie security attributes.
- Authentication rate limiting.
- User-enumeration resistance.

### 2.2 Authorization and Role-Based Access Control

The following authorization controls will be tested:

- Authentication middleware.
- Role-based authorization middleware.
- Deny-by-default behaviour.
- Student access restrictions.
- Instructor access restrictions.
- Administrator access permissions.
- Anonymous access to protected routes.
- Missing-token scenarios.
- Invalid-token scenarios.
- Expired-token scenarios.
- Vertical privilege escalation.
- Unauthorized administrative actions.
- Enforcement of server-side authorization independent of frontend controls.

### 2.3 IDOR and Resource Ownership

The following ownership scenarios will be tested:

- A student accessing another student's resources.
- A student modifying another student's lesson progress.
- An instructor accessing another instructor's course.
- An instructor modifying another instructor's course.
- A student accessing Instructor-only resources.
- Certificate ownership.
- Enrollment ownership.
- Purchase ownership.
- Module ownership.
- Course ownership.
- Object identifier enumeration.
- Horizontal privilege escalation.
- Vertical privilege escalation.
- Administrator ownership bypass where explicitly permitted.

Testing should target real application endpoints wherever they are implemented. Isolated middleware tests may support validation but will not be considered sufficient evidence of complete endpoint protection.

### 2.4 Audit Logging

The following audit events will be validated:

- User registration.
- Successful login.
- Failed login.
- Logout.
- Token refresh.
- Refresh-token replay detection.
- User activation.
- User deactivation.
- Administrative password reset.
- Profile changes.
- Authorization failures.

Each audit event will be reviewed for:

- Actor.
- Target.
- Action.
- Timestamp.
- Outcome.
- IP address where applicable.
- User agent where applicable.
- Security-relevant metadata.
- Immutability.
- Secure retention.

### 2.5 API Security and Business Logic

The following API security controls will be tested:

- Oversized request payloads.
- Missing required fields.
- Unexpected or unauthorized fields.
- Invalid JSON.
- Invalid content types.
- Error-information leakage.
- Security headers.
- CORS restrictions.
- Authentication rate limiting.
- Registration rate limiting.
- Refresh-token rate limiting.
- User enumeration.
- Invalid object identifiers.
- Duplicate or replayed requests.
- Unauthorized manipulation of server-controlled fields.
- Initial course-management business-logic abuse cases.

### 2.6 DevSecOps Validation

The following repository and pipeline controls will be reviewed:

- GitHub Actions CI workflow.
- GitHub Actions Security Pipeline.
- Gitleaks.
- npm audit.
- Semgrep.
- Dependabot.
- GitHub Action commit-SHA pinning.
- Local security-check script.
- Branch protection.
- Pull-request approval requirements.
- Required status checks.
- Security-review requirements.
- Security finding tracking.
- Pipeline failure handling.
- Prevention of insecure merges.

### 2.7 Vulnerability Retesting

Each vulnerability listed in the vulnerability register will be independently reviewed.

The retest will confirm:

- The original weakness.
- The affected component.
- The implemented remediation.
- The associated security test.
- The actual retest result.
- Supporting evidence.
- The correct status.
- Whether any residual risk remains.

---

## 3. Out-of-Scope Items

The following items are outside the immediate Week 2 validation scope unless they have already been implemented:

- Full production infrastructure penetration testing.
- Production cloud-configuration assessment.
- Payment-gateway penetration testing.
- Full OWASP ZAP authenticated scanning.
- Mobile application security testing.
- Advanced denial-of-service testing.
- Social-engineering testing.
- Physical security testing.
- Production secrets-rotation testing.
- Third-party vendor penetration testing.
- Formal compliance certification.
- Full disaster-recovery validation.

Any out-of-scope issue that creates an immediate security risk may still be recorded as a finding or known limitation.

---

## 4. Validation Methodology

The validation process will use a combination of:

- Source-code review.
- Configuration review.
- Automated unit tests.
- Integration tests.
- Manual API security testing.
- Negative security testing.
- Role and ownership testing.
- Dependency scanning.
- Secret scanning.
- Static application security testing.
- GitHub workflow review.
- Vulnerability reproduction.
- Remediation retesting.
- Evidence review.

The presence of security code or a test file will not by itself be considered proof that a control works.

A control will be considered verified only when:

1. The expected behaviour is clearly defined.
2. The test executes successfully.
3. The actual result matches the expected result.
4. Supporting evidence is retained.
5. Any discovered issue is recorded.
6. Remediation is independently retested where applicable.

---

## 5. Evidence Requirements

Each security test should contain:

- Unique test ID.
- Test category.
- Test objective.
- Preconditions.
- Test account or role.
- Endpoint or component tested.
- Test procedure.
- Expected result.
- Actual result.
- Status.
- Evidence location.
- Finding reference where applicable.
- Retest result where applicable.
- Tester name.
- Test date.

Evidence may include:

- Terminal output.
- HTTP request and response output.
- Automated test output.
- GitHub Actions results.
- Screenshots.
- Database query results.
- Application logs.
- Audit-event records.
- Source-code references.
- Security-tool reports.

Sensitive information such as passwords, access tokens, refresh tokens, API keys and database credentials must be removed or redacted before evidence is committed.

---

## 6. Result Classification

Each validation item will use one of the following statuses:

### PASS

The security control was tested successfully, produced the expected result and has sufficient evidence.

### PARTIAL

The control is implemented but some required scenarios, evidence or supporting protections remain incomplete.

### FAIL

The tested control did not produce the expected security result.

### BLOCKED

The test could not be completed because of an environmental, dependency, CI, database or implementation issue.

### NOT APPLICABLE

The control does not apply to the currently implemented Week 2 functionality.

---

## 7. Finding Classification

Security findings will be classified as:

- **Critical:** Immediate compromise, authentication bypass, remote code execution, production-secret exposure or similarly severe impact.
- **High:** Significant data exposure, IDOR, role bypass or privilege escalation.
- **Medium:** Missing hardening, insecure error handling, incomplete session controls or limited-impact security weakness.
- **Low:** Defence-in-depth, documentation or minor best-practice weakness.
- **Informational:** Observation or improvement recommendation with no immediate exploitable impact.

Critical and High findings will block unconditional Week 2 security sign-off until they are remediated and independently retested.

---

## 8. Vulnerability Status Definitions

The vulnerability register will use the following statuses:

- `Open`
- `In Progress`
- `Fixed — Awaiting Retest`
- `Closed`
- `Accepted Risk`

A finding may be marked `Closed` only when:

- The remediation is present.
- The associated test executes successfully.
- The vulnerability can no longer be reproduced.
- Retest evidence exists.
- The retest date is recorded.
- No related regression is observed.

Where code appears fixed but CI or testing is blocked, the correct status is:

```text
Fixed — Awaiting Retest

9. Week 2 Sign-Off Conditions

Week 2 may receive unconditional cybersecurity sign-off only when:

Authentication tests pass.
JWT validation tests pass.
Refresh-token tests pass.
Session-revocation tests pass.
RBAC tests pass.
IDOR tests pass against implemented application routes.
Audit events contain accurate security information.
API security tests pass.
CI executes successfully.
The Security Pipeline executes successfully.
Critical and High findings are closed.
Vulnerability-register entries are supported by retest evidence.
Required branch protections and pull-request checks are enforced.
Known limitations are documented and accepted.

Week 2 must not receive unconditional sign-off where:

CI remains red.
Automated tests cannot execute.
Critical or High findings remain unresolved.
IDOR protections are not tested against actual routes.
Audit records contain incorrect actors or incomplete outcomes.
Failed required checks can be bypassed without approval.
Security-sensitive pull requests lack independent review.
Vulnerabilities are marked closed without retest evidence.
10. Validation Deliverables

The Week 2 Cybersecurity Engineer 2 validation deliverables are:

Validation scope.
Environment and repository baseline.
Authentication test results.
RBAC test results.
IDOR test results.
Audit-log validation.
API security results.
DevSecOps validation.
Vulnerability retest report.
Week 2 cybersecurity sign-off.
Known limitations report.
Supporting security evidence.
Updated vulnerability register where necessary.
11. Validation Independence

Cybersecurity Engineer 2 is responsible for independently validating security controls and must not mark a control as passed solely because:

A developer stated that it was fixed.
A commit message described it as completed.
Documentation claimed that it was enabled.
A test file existed.
A vulnerability-register entry was already marked closed.

Validation status must be based on observable and repeatable evidence.
