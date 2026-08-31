# Week 2 DevSecOps Validation

## Overall Result

**Status: PASS WITH DOCUMENTED LIMITATIONS**

The Secure LMS server dependency installation, build process, database
migrations and automated security tests were independently validated using an
isolated PostgreSQL test database.

## Environment

- Node.js: 20.20.2
- npm: 10.8.2
- PostgreSQL: 16 Alpine
- Test database: `secure_lms_test`
- Test runner: Vitest 4.1.10
- Vite: 8.1.5
- Rolldown: 1.1.5
- Prisma Client: 7.8.0 in the server workspace

## Dependency Installation

The original committed lockfile contained an invalid Rolldown package record.
The record described unrelated legacy dependencies and omitted the required
`@rolldown/pluginutils` dependency.

A surgical lockfile repair was applied using validated npm registry metadata.

Post-remediation validation confirmed:

- clean `npm ci` completed successfully;
- `@rolldown/pluginutils@1.0.1` resolved successfully;
- `@oxc-project/types@0.139.0` resolved successfully;
- `rolldown@1.1.5` imported successfully;
- no unrelated dependency entries were deliberately changed.

## Database Validation

The isolated PostgreSQL test database was confirmed before testing.

All three Prisma migrations were applied successfully:

1. `20260716124801_init_schema`
2. `20260721084936_add_refresh_tokens`
3. `20260727085446_add_certificates_and_carts`

The database contained 14 tables, including `_prisma_migrations`.

## Build Validation

The server TypeScript build completed successfully:

- Command: `npm run build --workspace server`
- Exit code: `0`

The earlier complete repository build also completed successfully.

## Automated Security Test Result

Final test outcome:

- Test files: 5 passed
- Tests: 57 passed
- Failed tests: 0
- Exit code: 0

Test groups:

| Test area | Result |
|---|---:|
| Authentication | 23/23 passed |
| RBAC | 14/14 passed |
| IDOR middleware | 11/11 passed |
| Database security | 5/5 passed |
| HTTP security integration | 4/4 passed |

## Remediations Completed

### Rolldown dependency metadata

The corrupted `package-lock.json` Rolldown subtree was replaced with verified
dependency records, including the required plugin utilities and platform
bindings.

### Logout audit identity

The logout service now derives the audit actor from the stored refresh-token
record when an authenticated access-token identity is unavailable.

This preserves logout functionality for sessions whose access token has
expired while maintaining audit traceability.

### Concurrent-session test isolation

The registration-generated refresh-token family is removed during the
concurrent-session test setup so that the test measures only the two explicit
login sessions.

### IDOR fixture lifecycle

IDOR database fixtures are recreated before each individual test because the
global test setup removes database records after every test.

## Test Database Cleanup

After the final successful suite, all 13 application tables contained zero
rows. This confirms that automated tests did not leave residual users, tokens,
audit events, courses, certificates or other application data.

## Limitations

1. IDOR tests validate the ownership middleware through isolated test routes.
   They do not demonstrate that every production API route correctly mounts
   the middleware.

2. RBAC permission denials are emitted as structured JSON warning logs but are
   not persisted in the `AuditEvent` database table.

3. Prisma workspace versions are not fully aligned:
   - root `@prisma/client`: 7.9.1
   - server Prisma packages: 7.8.0

4. The Prisma tooling dependency chain reports a Node.js engine warning for
   `@prisma/streams-local`, which requires Node.js 22 or newer. The server
   application and automated tests nevertheless completed successfully on
   Node.js 20.20.2.

5. Dependency audit findings remain separately documented and were not
   automatically altered using `npm audit fix` or forced upgrades.

## Conclusion

The DevSecOps validation is considered **PASS WITH DOCUMENTED LIMITATIONS**.

The server builds successfully, the dependency startup defect has been
remediated, all 57 automated tests pass, and the isolated test database is
clean after execution.

Production security sign-off should still consider real-route IDOR coverage,
persistent audit logging for authorization denials, Prisma version alignment
and outstanding dependency vulnerabilities.
