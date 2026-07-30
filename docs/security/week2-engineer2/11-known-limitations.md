# Week 2 Known Security Limitations

## 1. Production-route IDOR coverage

The existing IDOR tests mount `requireOwnership` on isolated Express test
routes. They validate middleware behaviour but do not prove that every
production endpoint requiring ownership enforcement mounts the middleware
correctly.

**Risk:** A production route could omit the middleware even though the
middleware itself passes its tests.

**Recommendation:** Add route-level integration tests for each sensitive
course, module, lesson-progress, enrollment, purchase and certificate endpoint.

## 2. Authorization denials are not persisted

RBAC denials produce structured JSON warning logs, but the events are not
written to the `AuditEvent` database table.

**Risk:** Investigation and compliance reporting may depend on external log
retention rather than immutable application audit records.

**Recommendation:** Persist important authorization-denial events with actor,
role, route, method, required permission, timestamp and request correlation ID.

## 3. Prisma version misalignment

The root workspace resolves `@prisma/client@7.9.1`, while the server workspace
uses Prisma 7.8.0 packages.

**Risk:** Future clean installations or dependency upgrades may produce
generation or runtime inconsistencies.

**Recommendation:** Align Prisma CLI, client and adapter packages to one
explicitly supported version.

## 4. Node.js engine warning

`@prisma/streams-local@0.1.2` requires Node.js 22 or newer, while validation
was performed with Node.js 20.20.2.

**Risk:** Some Prisma development tooling may fail or behave unpredictably,
even though the current server build and tests pass.

**Recommendation:** Plan and validate an upgrade to an actively supported
Node.js 22 LTS environment.

## 5. Dependency vulnerabilities

The dependency audit reported:

- 22 total vulnerabilities;
- 18 high;
- 4 moderate;
- no critical vulnerabilities.

The production-only audit reported four moderate findings.

**Recommendation:** Review and remediate each dependency through controlled
version upgrades. Do not use forced or unreviewed automated upgrades.
