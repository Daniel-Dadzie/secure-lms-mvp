# Week 2 IDOR Test Results

## Overall Result

**PASS WITH DOCUMENTED LIMITATION**

All 11 ownership and IDOR-prevention tests passed after correcting the test
fixture lifecycle.

## Final Test Result

| Metric | Result |
|---|---:|
| IDOR tests | 11 |
| Passed | 11 |
| Failed | 0 |
| Status | PASS |

## Resources Validated

Ownership checks were validated for:

- lesson-progress records;
- course modules;
- certificates.

## Lesson-Progress Ownership

The tests confirmed:

- a student can access their own lesson-progress record;
- another student cannot access that record;
- an unauthenticated requester is denied;
- an administrator can bypass ownership restrictions.

Unauthorized ownership attempts returned HTTP `404` rather than `403` to
reduce resource-enumeration risk.

## Module Ownership

The tests confirmed:

- an instructor can access a module belonging to a course they teach;
- another instructor cannot access that module;
- a student cannot access the module through instructor ownership controls;
- an administrator can bypass ownership restrictions.

## Certificate Ownership

The tests confirmed:

- a student can access their own certificate;
- another student cannot access that certificate;
- an administrator can bypass ownership restrictions.

## Fixture Lifecycle Remediation

The original IDOR suite created database fixtures once using `beforeAll`.

The global test setup deleted database records after every test. Consequently,
later tests queried resources that had already been removed.

The database fixtures are now recreated with `beforeEach`.

**Status: Remediated**

## Ownership Response Policy

For authenticated users who do not own the requested resource, the middleware
returns HTTP `404`.

This avoids confirming whether the requested resource exists and helps reduce
ID enumeration and resource-discovery attacks.

## Open Limitation

These tests mount the ownership middleware on isolated Express test routes.

They validate the middleware logic but do not prove that every sensitive
production route mounts the middleware correctly.

**Recommendation:** Add route-level integration tests for all production
course, module, lesson-progress, enrollment, purchase and certificate routes.

## Conclusion

IDOR middleware validation is **PASS WITH DOCUMENTED LIMITATION**.

All 11 automated ownership tests passed after correcting the fixture lifecycle.
Production-route middleware coverage remains a separate validation requirement.
