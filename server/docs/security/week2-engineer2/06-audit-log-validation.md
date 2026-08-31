# Week 2 Audit Log Validation

## Overall Result

**PASS WITH DOCUMENTED LIMITATION**

The automated test suite confirmed that important authentication and
administrative actions generate audit events.

## Validated Audit Events

Audit-event creation was confirmed for:

| Event | Result |
|---|---|
| User registration | PASS |
| Successful login | PASS |
| Token refresh | PASS |
| Logout | PASS |
| Administrator user activation | PASS |
| Administrator user deactivation | PASS |

## Logout Audit Remediation

The logout route does not require a valid access token because a user may need
to revoke a session after the access token expires.

Previously, the logout controller could therefore call the service without an
authenticated user ID.

The logout service now retrieves the refresh-token owner and uses that identity
for the audit event when the authenticated request identity is unavailable.

The logout audit-event test passed following remediation.

## Audit Data Protection

The HTTP-security tests confirmed that the application does not expose audit
event modification endpoints.

This supports the principle that audit records should not be directly editable
through the public application API.

## Administrative Activity

The integration tests confirmed audit-event creation for administrator-driven
user activation and deactivation.

These actions are security-sensitive because they change account access.

## Authentication Activity

Database and authentication tests confirmed audit records for:

- registration;
- successful login;
- token refresh;
- logout.

## Open Limitation

RBAC permission denials produce structured JSON warning logs but are not
persisted in the `AuditEvent` table.

**Risk:** The availability of authorization-denial history depends on external
log collection and retention.

**Recommendation:** Persist important permission-denial events with:

- actor ID;
- actor role;
- required role or permission;
- request method;
- request route;
- timestamp;
- source IP address;
- request correlation ID.

## Conclusion

Audit-log validation is **PASS WITH DOCUMENTED LIMITATION**.

The tested authentication and administrative actions generate audit events.
Persistent recording of RBAC denial events remains an open improvement.
