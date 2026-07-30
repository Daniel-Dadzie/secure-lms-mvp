# Week 2 RBAC Test Results

## Overall Result

**PASS WITH DOCUMENTED LIMITATION**

All 14 role-based access-control tests passed.

## Final Test Result

| Metric | Result |
|---|---:|
| RBAC tests | 14 |
| Passed | 14 |
| Failed | 0 |
| Status | PASS |

## Roles Validated

The role model included:

- `STUDENT`
- `INSTRUCTOR`
- `ADMIN`

## Validated Controls

The RBAC tests confirmed:

- students cannot access the administrative user list;
- instructors cannot access the administrative user list;
- administrators can access the administrative user list;
- students cannot deactivate users;
- non-administrative roles never receive successful access to admin routes;
- expired bearer tokens are rejected;
- tokens signed with the wrong secret are rejected;
- students cannot use administrative routes to escalate privileges;
- authorization denials produce structured JSON warning logs.

## Deny-by-Default Behaviour

Administrative endpoints rejected authenticated users whose roles were not
explicitly authorised.

The tests verified that both students and instructors were denied access to
administrator-only operations.

## Token Validation

RBAC enforcement also rejected:

- expired access tokens;
- access tokens signed using an invalid secret;
- requests without the required administrator role.

## Logging

Permission denials generated structured warning logs containing information
such as:

- user ID;
- current role;
- required roles;
- HTTP method;
- request path;
- source IP address;
- timestamp.

## Open Limitation

Authorization-denial events are written to structured application logs but are
not persisted in the `AuditEvent` database table.

**Risk:** Investigation and compliance reporting may depend on external log
retention.

**Recommendation:** Persist high-value authorization denials with the actor,
role, route, method, required permission, timestamp and correlation ID.

## Conclusion

RBAC validation is **PASS WITH DOCUMENTED LIMITATION**.

All 14 automated RBAC tests passed. The tested routes enforced administrator
permissions and rejected expired, invalid and insufficiently privileged access
tokens.
