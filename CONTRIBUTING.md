# Contributing to Secure LMS MVP

Quick reference for how we branch, commit, and merge as a team. Read this before your first push.

## 1. Before you start

```bash
git clone https://github.com/<org-or-username>/secure-lms-mvp.git
cd secure-lms-mvp
npm install
cp .env.example .env
```

Fill in your own `.env` with local DB credentials and Firebase config. Never commit `.env` — it's gitignored on purpose.

## 2. Branch naming

Never commit directly to `main`. Create a branch off `main` for every piece of work:

| Type | Prefix | Example |
|---|---|---|
| New feature | `feature/` | `feature/instructor-course-crud` |
| Bug fix | `fix/` | `fix/enrollment-race-condition` |
| Security work | `security/` | `security/rbac-hardening` |
| UI/UX only | `ui/` | `ui/student-dashboard-layout` |
| Docs | `docs/` | `docs/api-endpoints` |
| Chore (config, deps, scaffolding) | `chore/` | `chore/eslint-setup` |

```bash
git checkout main
git pull origin main
git checkout -b feature/your-branch-name
```

## 3. Commits

Use short, present-tense messages. Prefix with the area you touched where useful:

```
auth: add JWT refresh token endpoint
courses: fix pagination on instructor dashboard
security: add rate limiting to login route
```

Commit often — small, reviewable commits beat one giant commit at the end.

## 4. Pull requests

1. Push your branch: `git push origin feature/your-branch-name`
2. Open a PR into `main` on GitHub
3. Fill in: what changed, why, and how to test it
4. **At least 1 review required before merge** (branch protection enforces this)
5. If your change touches auth, RBAC, payments, or data validation — tag one of the cybersecurity team (Emmanuel, Amuzie, or Fedelis) as a reviewer
6. Squash-merge once approved; delete the branch after merge

## 5. Who owns what (tag for review)

| Area | Reviewer(s) |
|---|---|
| Frontend (Next.js, components) | Alice |
| UI/UX, design system | Chioma |
| Auth, RBAC, security-sensitive code | Emmanuel, Amuzie, Fedelis |
| Backend API, database, Firebase | Daniel |

## 6. Daily sync

Post a quick update in the team group chat:
- What you shipped
- What you're blocked on
- Anything you need reviewed today

If you're unresponsive for more than a day without notice, flag it to the project lead — the brief asks us to surface this early, not at the deadline.

## 7. Environment & secrets

- Never commit `.env`, `serviceAccountKey.json`, or any credentials
- If you accidentally commit a secret, tell the team immediately — rotate the credential, don't just delete the commit (it's still in git history)
- Local DB and Firebase config always come from your own `.env`, copied from `.env.example`
