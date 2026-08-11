# SEC-015 — Public Course Content Authorization

## Finding

The public course modules endpoint exposed protected lesson `contentUrl`
values without requiring authentication or active enrollment.

The same endpoint also returned module and lesson metadata for draft courses
when the caller knew the course ID.

## Severity

High

## Category

CAT-001 — Authentication & Authorization

## Security Classification

Broken Access Control / Content Authorization / Information Disclosure

## Affected Component

`server/src/modules/courses`

## Reproduction

Pre-remediation testing confirmed that:

- unauthenticated users could retrieve lesson `contentUrl`;
- draft-course modules were publicly retrievable;
- the protected lesson endpoint correctly withheld content from
  non-enrolled students;
- actively enrolled students correctly received protected lesson content.

This isolated the authorization defect to the public modules endpoint.

## Remediation

The modules service was modified to:

1. Validate that the requested course is both `PUBLISHED` and active.
2. Return HTTP 404 for draft, archived, inactive, or unknown courses.
3. Use a dedicated public module selector.
4. Exclude lesson `contentUrl` from public module responses.
5. Preserve the existing protected lesson endpoint for authorized
   content delivery.

## Retest Results

- SEC-015 targeted regression: 4/4 tests passed.
- Full server regression: 61/61 tests passed.
- Client production build: PASS.
- Server production build: PASS.
- Prisma migration validation: PASS.
- Gitleaks: PASS — no leaks found.
- Semgrep: PASS — 0 findings.
- Dependency security gate: PASS at configured High threshold.
- Full PR validation: PASS.
- Repository integrity verification: PASS.
- Evidence sanitisation verification: PASS.

## Final Status

**CLOSED — 2026-08-11**

The High-severity content authorization vulnerability has been remediated,
retested, and validated through the project security and PR validation gates.
