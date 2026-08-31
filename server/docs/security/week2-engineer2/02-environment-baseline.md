# Week 2 Environment and Repository Baseline

## 1. Baseline Information

| Item | Recorded value |
|---|---|
| Project | Secure LMS MVP |
| Repository | `Daniel-Dadzie/secure-lms-mvp` |
| Validation role | Cybersecurity Engineer 2 — Security Testing and Validation |
| Validation branch | `security/week2-engineer2-validation` |
| Tested commit | `3c65f2df18a2516f656f7203dee1ac8d1c2beb0b` |
| Capture date | `2026-07-29T15:52:20+01:00` |
| Working directory | `/home/amuzie/workspace/secure-lms-learning/secure-lms-mvp` |
| Operating environment | WSL2 |
| Operating system | Ubuntu 24.04.4 LTS |
| Architecture | x86_64 |

The complete terminal output supporting this report is stored in:

evidence/devsecops/environment-baseline.txt

## 2. Development Tool Versions

| Tool                          | Version or status                                |
| ----------------------------- | ------------------------------------------------ |
| Node.js                       | `v20.20.2`                                       |
| npm                           | `10.8.2`                                         |
| Git                           | `2.43.0`                                         |
| Docker CLI                    | Unavailable inside the current WSL2 distribution |
| Docker Compose                | Unavailable inside the current WSL2 distribution |
| Prisma CLI                    | `7.8.0`                                          |
| TypeScript reported by Prisma | `5.9.3`                                          |
| Prisma Studio                 | `0.27.3`                                         |

## 3. Repository State

The validation started from the following branch:

security/week2-engineer2-validation

The baseline commit is:

3c65f2df18a2516f656f7203dee1ac8d1c2beb0b

The working tree contained only the newly created Week 2 validation directory:

?? docs/security/week2-engineer2/

No existing tracked application file had been modified when the baseline was captured.

The configured remote repository is:

git@github.com:Daniel-Dadzie/secure-lms-mvp.git

## 4. Repository Structure

The repository uses an npm workspace monorepository structure:

client
server
packages/*

The following CI and security files were present:

.github/dependabot.yml
.github/workflows/ci.yml
.github/workflows/security.yml
.gitleaks.toml
run_security_checks.sh

Important server files included:

server/Dockerfile
server/package.json
server/prisma.config.ts
server/prisma/schema.prisma
server/src/app.ts
server/src/env.ts
server/src/server.ts
server/tests/setup.ts
server/vitest.config.ts

## 5. Security-Relevant Dependency Declarations
Root package

The root package.json declares:

@prisma/client: ^7.9.1

The root package does not directly declare Prisma CLI, Vitest, Helmet, JSON Web Token, bcrypt or Express rate-limiting packages.

Server package

| Dependency           | Declared version |
| -------------------- | ---------------- |
| `@prisma/client`     | `7.8.0`          |
| `prisma`             | `7.8.0`          |
| `vitest`             | `^4.1.10`        |
| `jsonwebtoken`       | `^9.0.3`         |
| `bcrypt`             | `^6.0.0`         |
| `bcryptjs`           | `^3.0.3`         |
| `helmet`             | `^8.3.0`         |
| `express-rate-limit` | `^8.6.1`         |

## 6. Installed Dependency State

The current installation reported:

| Dependency           | Installed version |
| -------------------- | ----------------- |
| `@prisma/client`     | `7.8.0`           |
| `prisma`             | `7.8.0`           |
| `vitest`             | `4.1.10`          |
| `jsonwebtoken`       | `9.0.3`           |
| `bcryptjs`           | `3.0.3`           |
| `express-rate-limit` | `8.6.0`           |

npm returned:

npm error code ELSPROBLEMS
npm error invalid: express-rate-limit@8.6.0

The installed express-rate-limit version does not satisfy the server declaration of ^8.6.1.

This indicates that the current node_modules installation may be stale or inconsistent with the package manifest and lockfile.

## 7. Prisma Version Inconsistency

A Prisma dependency inconsistency was identified:

| Location                               | Prisma-related version  |
| -------------------------------------- | ----------------------- |
| Root `package.json`                    | `@prisma/client ^7.9.1` |
| Server `package.json`                  | `@prisma/client 7.8.0`  |
| Server `package.json`                  | `prisma 7.8.0`          |
| Installed Prisma CLI                   | `7.8.0`                 |
| Installed server client                | `7.8.0`                 |
| Prisma CLI-reported client declaration | `^7.9.1`                |

Initial classification
Status: PARTIAL
Category: Dependency consistency
Impact: Prisma generation, migration, build and runtime compatibility require validation

This has not yet been classified as a confirmed security vulnerability.

Stage 4 will determine whether a clean installation resolves the inconsistency or whether the project manifests require remediation.

## 8. Docker and Database Testing Limitation

Docker CLI and Docker Compose were unavailable inside the current WSL2 distribution.

The terminal indicated that Docker Desktop WSL integration must be activated.

Potential effect

This may prevent:

Starting PostgreSQL through docker-compose.yml.
Reproducing the GitHub Actions PostgreSQL service locally.
Running container-dependent integration tests.
Validating the server Docker image locally.
Initial classification
Status: BLOCKED for Docker-dependent validation
Impact: Source review, linting and non-container tests may still proceed
Required action: Restore Docker Desktop WSL2 integration before container validation

This will remain documented as an environment limitation unless another PostgreSQL instance is available.

## 9. Existing Build Artifacts

Existing generated files were present under:

server/dist/

These files existed before the current validation process and must not be treated as proof that the current source code builds successfully.

A fresh build must be performed during Stage 4.

## 10. Baseline Findings Summary

| Baseline ID | Observation                                                  | Status        | Significance                                               |
| ----------- | ------------------------------------------------------------ | ------------- | ---------------------------------------------------------- |
| BASE-001    | Docker unavailable inside WSL2                               | BLOCKED       | Prevents Docker-dependent validation                       |
| BASE-002    | Root and server Prisma versions are inconsistent             | PARTIAL       | May cause generation, migration or runtime incompatibility |
| BASE-003    | Installed `express-rate-limit` is below the declared version | PARTIAL       | Indicates stale or inconsistent dependencies               |
| BASE-004    | npm dependency inspection returned `ELSPROBLEMS`             | PARTIAL       | Clean installation and lockfile validation are required    |
| BASE-005    | Existing `server/dist` files are present                     | INFORMATIONAL | Existing artifacts are not fresh-build evidence            |
| BASE-006    | Validation documentation is currently untracked              | EXPECTED      | Documents will be committed after validation               |

## 11. Stage 4 Validation Requirements

Stage 4 must verify:

Whether npm ci completes successfully.
Whether the installed dependency tree matches the lockfile.
Whether Prisma Client generates successfully.
Whether database migrations execute successfully.
Whether linting passes.
Whether the client and server build successfully.
Whether Vitest starts successfully.
Whether authentication, RBAC, IDOR and integration tests execute.
Whether the observed dependency inconsistencies remain.
Whether Docker-dependent testing can be performed.

## 12. Baseline Conclusion

The repository is correctly checked out on the dedicated Week 2 Engineer 2 validation branch. The initial Git working tree was clean apart from the expected validation documentation.

The environment is not yet considered fully test-ready because:

Docker is unavailable inside WSL2.
Prisma dependency declarations are inconsistent.
The installed rate-limiting dependency does not match its declared range.
npm reports an invalid dependency tree.

These observations will remain part of the validation evidence. Stage 4 will determine which issues are corrected through a clean dependency installation and which require project remediation.

---

## 13. Post-Baseline Docker Environment Update

A follow-up verification was performed on:

2026-07-29T17:39:46+01:00

Docker Desktop was started and WSL2 integration became available to the Ubuntu environment.

The follow-up verification confirmed:

- Docker CLI is accessible from WSL2.
- Docker Compose is installed and operational.
- The `secure-lms-postgres` container is running.
- PostgreSQL uses the `postgres:16-alpine` image.
- The container reports a healthy state.
- PostgreSQL is exposed on local port `5432`.
- Direct PostgreSQL readiness and local port connectivity were tested.

Supporting evidence is stored in:

`evidence/devsecops/docker-postgresql-verification.txt`

### BASE-001 Updated Status

| Baseline ID | Original condition | Updated status | Assessment |
|---|---|---|---|
| BASE-001 | Docker unavailable inside WSL2 | RESOLVED | Docker and PostgreSQL-dependent validation may proceed |

The original baseline observation remains valid as a record of the environment at the initial capture time. This update documents that the limitation was subsequently remediated.
