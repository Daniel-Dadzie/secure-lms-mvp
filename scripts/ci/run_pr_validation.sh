#!/usr/bin/env bash

set -uo pipefail

MODE="${1:-all}"

case "$MODE" in
  all|application|security|gitleaks|audit|semgrep)
    ;;
  --help|-h)
    cat <<'HELP'
Usage:
  scripts/ci/run_pr_validation.sh [mode]

Modes:
  all          Run application and security validation
  application  Install, generate Prisma Client, migrate, lint, build and test
  security     Run Gitleaks, npm audit and Semgrep
  gitleaks     Run secret scanning only
  audit        Run production dependency audits only
  semgrep      Run Semgrep SAST only

Environment:
  EVIDENCE_ROOT  Base directory for generated evidence
                 Default: .ci-evidence/pr-validation
HELP
    exit 0
    ;;
  *)
    echo "Unsupported validation mode: $MODE" >&2
    echo "Run with --help to see supported modes." >&2
    exit 2
    ;;
esac

REPOSITORY_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." &&
  pwd
)"

cd "$REPOSITORY_ROOT" || exit 1

for required_path in \
  package.json \
  package-lock.json \
  client \
  server \
  packages/shared \
  server/prisma.config.ts
do
  if [[ ! -e "$required_path" ]]; then
    echo "Missing required repository path: $required_path" >&2
    exit 1
  fi
done

TIMESTAMP="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
EVIDENCE_ROOT="${EVIDENCE_ROOT:-.ci-evidence/pr-validation}"
RUN_IDENTIFIER="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-${MODE}-${TIMESTAMP}"
EVIDENCE_DIR="$EVIDENCE_ROOT/$RUN_IDENTIFIER"

mkdir -p "$EVIDENCE_DIR"

OVERALL_FAILURE=0
STARTED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
WORKSPACE_STATE_DIR=""

record_message() {
  local file_name="$1"
  shift

  printf '%s\n' "$*" | tee "$EVIDENCE_DIR/$file_name"
}

mark_missing_command() {
  local command_name="$1"
  local evidence_name="$2"

  record_message \
    "$evidence_name" \
    "FAIL: Required command is unavailable: $command_name"

  OVERALL_FAILURE=1
}

run_step() {
  local step_name="$1"
  shift

  local evidence_file="$EVIDENCE_DIR/${step_name}.txt"

  {
    echo "Step: $step_name"
    echo "Started: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    echo
  } | tee "$evidence_file"

  "$@" 2>&1 | tee -a "$evidence_file"
  local exit_code="${PIPESTATUS[0]}"

  {
    echo
    echo "Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    echo "Exit code: $exit_code"
  } | tee -a "$evidence_file"

  if [[ "$exit_code" -ne 0 ]]; then
    OVERALL_FAILURE=1
  fi

  return "$exit_code"
}

write_metadata() {
  {
    echo "Repository: ${GITHUB_REPOSITORY:-Daniel-Dadzie/secure-lms-mvp}"
    echo "Validation mode: $MODE"
    echo "Started at: $STARTED_AT"
    echo "Branch: ${GITHUB_HEAD_REF:-$(git branch --show-current)}"
    echo "Commit: ${GITHUB_SHA:-$(git rev-parse HEAD)}"
    echo "Pull request: ${GITHUB_EVENT_NUMBER:-${PR_NUMBER:-not-applicable}}"
    echo "Workflow: ${GITHUB_WORKFLOW:-local}"
    echo "Workflow run ID: ${GITHUB_RUN_ID:-local}"
    echo "Workflow attempt: ${GITHUB_RUN_ATTEMPT:-1}"
    echo "Actor: ${GITHUB_ACTOR:-local-user}"
    echo "Event: ${GITHUB_EVENT_NAME:-local}"
    echo "Operating system: $(uname -srm)"
    echo "Node.js: $(node --version 2>/dev/null || echo unavailable)"
    echo "npm: $(npm --version 2>/dev/null || echo unavailable)"
    echo "Evidence directory: $EVIDENCE_DIR"
  } > "$EVIDENCE_DIR/metadata.txt"
}

snapshot_workspace_state() {
  WORKSPACE_STATE_DIR="$(mktemp -d)"

  git status \
    --porcelain=v1 \
    --untracked-files=all \
    > "$WORKSPACE_STATE_DIR/git-status-before.txt"

  if [[ -e client/next-env.d.ts ]]; then
    cp \
      client/next-env.d.ts \
      "$WORKSPACE_STATE_DIR/next-env.d.ts"

    printf 'present\n' \
      > "$WORKSPACE_STATE_DIR/next-env.state"
  else
    printf 'absent\n' \
      > "$WORKSPACE_STATE_DIR/next-env.state"
  fi
}

restore_generated_files() {
  if [[ -z "$WORKSPACE_STATE_DIR" ]] ||
     [[ ! -d "$WORKSPACE_STATE_DIR" ]]; then
    return 0
  fi

  local state

  state="$(
    cat "$WORKSPACE_STATE_DIR/next-env.state" 2>/dev/null ||
    printf 'unknown'
  )"

  case "$state" in
    present)
      cp \
        "$WORKSPACE_STATE_DIR/next-env.d.ts" \
        client/next-env.d.ts
      ;;
    absent)
      rm -f client/next-env.d.ts
      ;;
    *)
      echo "Unknown generated-file snapshot state: $state" >&2
      return 1
      ;;
  esac
}

verify_workspace_integrity() {
  local before_file
  local after_file
  local evidence_file

  before_file="$WORKSPACE_STATE_DIR/git-status-before.txt"
  after_file="$WORKSPACE_STATE_DIR/git-status-after.txt"
  evidence_file="$EVIDENCE_DIR/workspace-integrity.txt"

  git status \
    --porcelain=v1 \
    --untracked-files=all \
    > "$after_file"

  if cmp -s "$before_file" "$after_file"; then
    record_message \
      "workspace-integrity.txt" \
      "PASS: Validation left the repository working state unchanged."

    return 0
  fi

  {
    echo "FAIL: Validation changed the repository working state."
    echo
    echo "Differences between pre-validation and post-validation status:"
    echo

    diff \
      --unified \
      "$before_file" \
      "$after_file" ||
      true
  } > "$evidence_file"

  cat "$evidence_file"
  return 1
}

# shellcheck disable=SC2317
cleanup_workspace_state() {

  if [[ -n "$WORKSPACE_STATE_DIR" ]] &&
     [[ -d "$WORKSPACE_STATE_DIR" ]]; then
    restore_generated_files >/dev/null 2>&1 || true
    rm -rf "$WORKSPACE_STATE_DIR"
  fi
}

run_application_validation() {
  if ! command -v node >/dev/null 2>&1; then
    mark_missing_command "node" "node-preflight.txt"
    return
  fi

  if ! command -v npm >/dev/null 2>&1; then
    mark_missing_command "npm" "npm-preflight.txt"
    return
  fi

  if ! run_step "npm-ci" npm ci; then
    record_message \
      "application-steps-skipped.txt" \
      "Dependent application checks were skipped because npm ci failed."
    return
  fi

  run_step \
    "prisma-generate" \
    bash -lc \
    'cd server && npx prisma generate --config prisma.config.ts'

  run_step \
    "prisma-migrate-deploy" \
    bash -lc \
    'cd server && npx prisma migrate deploy --config prisma.config.ts'

  run_step \
    "lint" \
    npm run lint --workspaces --if-present

  run_step \
    "build" \
    npm run build --workspaces --if-present

  run_step \
    "tests" \
    npm run test --workspaces --if-present
}

run_gitleaks_validation() {
  if ! command -v gitleaks >/dev/null 2>&1; then
    mark_missing_command "gitleaks" "gitleaks.txt"
    return
  fi

  run_step \
    "gitleaks" \
    gitleaks detect \
      --source . \
      --config .gitleaks.toml \
      --redact \
      --verbose
}

run_dependency_validation() {
  if ! command -v npm >/dev/null 2>&1; then
    mark_missing_command "npm" "npm-audit-preflight.txt"
    return
  fi

  local workspace

  for workspace in client server packages/shared; do
    local evidence_name
    evidence_name="npm-audit-${workspace//\//-}"

    run_step \
      "$evidence_name" \
      npm audit \
        --workspace="$workspace" \
        --omit=dev \
        --audit-level=high \
        --package-lock-only
  done
}

run_semgrep_validation() {
  if ! command -v semgrep >/dev/null 2>&1; then
    mark_missing_command "semgrep" "semgrep.txt"
    return
  fi

  run_step \
    "semgrep" \
    semgrep scan \
      --config p/owasp-top-ten \
      --config p/javascript \
      --config p/typescript \
      --config p/expressjs \
      --config p/react \
      --error \
      .
}

sanitise_evidence() {
  python3 - "$EVIDENCE_DIR" <<'PY'
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])

sensitive_environment_variables = (
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "GITHUB_TOKEN",
    "GH_TOKEN",
)

literal_secrets = [
    os.environ[name]
    for name in sensitive_environment_variables
    if os.environ.get(name) and len(os.environ[name]) >= 4
]

patterns = (
    (
        re.compile(
            r"postgres(?:ql)?://[^:\s/@]+:[^@\s/]+@",
            re.IGNORECASE,
        ),
        "postgresql://[REDACTED]@",
    ),
    (
        re.compile(
            r"(authorization\s*:\s*bearer\s+)\S+",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
    (
        re.compile(
            r"\bBearer\s+eyJ[A-Za-z0-9._-]+",
            re.IGNORECASE,
        ),
        "Bearer [REDACTED]",
    ),
    (
        re.compile(
            r"(refresh[_-]?token[\"'=:\s]+)[A-Za-z0-9._~-]{20,}",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
    (
        re.compile(
            r"(access[_-]?token[\"'=:\s]+)[A-Za-z0-9._~-]{20,}",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
)

supported_suffixes = {
    ".txt",
    ".log",
    ".json",
    ".md",
    ".yaml",
    ".yml",
}

for path in root.rglob("*"):
    if not path.is_file():
        continue

    if path.suffix.lower() not in supported_suffixes:
        continue

    text = path.read_text(encoding="utf-8", errors="replace")

    for secret in literal_secrets:
        text = text.replace(secret, "[REDACTED]")

    for pattern, replacement in patterns:
        text = pattern.sub(replacement, text)

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    lines = [line.rstrip(" \t") for line in text.split("\n")]

    while lines and lines[-1] == "":
        lines.pop()

    path.write_text(
        "\n".join(lines) + "\n",
        encoding="utf-8",
        newline="\n",
    )
PY
}

verify_evidence_safety() {
  local output_file
  local exit_code

  output_file="$EVIDENCE_DIR/evidence-safety-verification.txt"

  python3 \
    - "$EVIDENCE_DIR" \
    > "$output_file" \
    2>&1 <<'PYVERIFY'
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])

literal_secret_names = (
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "GITHUB_TOKEN",
    "GH_TOKEN",
)

supported_suffixes = {
    ".txt",
    ".log",
    ".json",
    ".md",
    ".yaml",
    ".yml",
}

patterns = {
    "credential-bearing PostgreSQL URL": re.compile(
        r"postgres(?:ql)?://[^:\s/@]+:[^@\s/]+@",
        re.IGNORECASE,
    ),
    "JWT-shaped value": re.compile(
        r"\beyJ[A-Za-z0-9_-]+\."
        r"[A-Za-z0-9_-]+\."
        r"[A-Za-z0-9_-]+\b"
    ),
    "Authorization bearer credential": re.compile(
        r"(?i)"
        r"\bauthorization\b[^\n]{0,30}"
        r"\bbearer\s+"
        r"(?!\[REDACTED\])"
        r"(?:"
        r"eyJ[A-Za-z0-9._-]{20,}"
        r"|[A-Za-z0-9._~+/=-]{24,}"
        r")"
    ),
    "access or refresh token assignment": re.compile(
        r"(?i)"
        r"\b(?:access|refresh)[_-]?token\b"
        r"\s*[=:]\s*[\"']?"
        r"(?!\[REDACTED\])"
        r"(?:"
        r"eyJ[A-Za-z0-9._-]{20,}"
        r"|[A-Za-z0-9._~+/=-]{24,}"
        r")"
    ),
}

findings: set[tuple[str, str]] = set()

for path in root.rglob("*"):
    if not path.is_file():
        continue

    if path.name in {
        "evidence-manifest.sha256",
        ".safe-to-upload",
    }:
        continue

    if path.suffix.lower() not in supported_suffixes:
        continue

    text = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    for name in literal_secret_names:
        value = os.environ.get(name)

        if value and len(value) >= 4 and value in text:
            findings.add(
                (
                    f"literal environment value: {name}",
                    str(path.relative_to(root)),
                )
            )

    for description, pattern in patterns.items():
        if pattern.search(text):
            findings.add(
                (
                    description,
                    str(path.relative_to(root)),
                )
            )

if findings:
    print("FAIL: Evidence safety verification detected potential sensitive data.")

    for description, relative_path in sorted(findings):
        print(f"- {description}: {relative_path}")

    raise SystemExit(1)

print("PASS: Strict evidence sanitisation verification passed")
PYVERIFY

  exit_code=$?
  cat "$output_file"

  return "$exit_code"
}

write_summary() {
  local result="PASS"

  if [[ "$OVERALL_FAILURE" -ne 0 ]]; then
    result="FAIL"
  fi

  {
    echo "Secure LMS PR Validation Summary"
    echo
    echo "Mode: $MODE"
    echo "Result: $result"
    echo "Commit: ${GITHUB_SHA:-$(git rev-parse HEAD)}"
    echo "Branch: ${GITHUB_HEAD_REF:-$(git branch --show-current)}"
    echo "Started: $STARTED_AT"
    echo "Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    echo "Evidence directory: $EVIDENCE_DIR"
  } > "$EVIDENCE_DIR/validation-summary.txt"
}

create_manifest() {
  (
    cd "$EVIDENCE_DIR" || exit 1

    find . \
      -type f \
      ! -name 'evidence-manifest.sha256' \
      -print0 |
      sort -z |
      xargs -0 -r sha256sum \
      > evidence-manifest.sha256
  )
}

write_metadata

if ! snapshot_workspace_state; then
  record_message     "workspace-snapshot.txt"     "FAIL: Unable to capture the initial repository working state."

  exit 1
fi

trap cleanup_workspace_state EXIT

case "$MODE" in
  application)
    run_application_validation
    ;;
  gitleaks)
    run_gitleaks_validation
    ;;
  audit)
    run_dependency_validation
    ;;
  semgrep)
    run_semgrep_validation
    ;;
  security)
    run_gitleaks_validation
    run_dependency_validation
    run_semgrep_validation
    ;;
  all)
    run_application_validation
    run_gitleaks_validation
    run_dependency_validation
    run_semgrep_validation
    ;;
esac

if ! restore_generated_files; then
  record_message     "workspace-restoration.txt"     "FAIL: Generated repository files could not be restored."

  OVERALL_FAILURE=1
fi

if ! verify_workspace_integrity; then
  OVERALL_FAILURE=1
fi

rm -rf "$WORKSPACE_STATE_DIR"
WORKSPACE_STATE_DIR=""
trap - EXIT

write_summary
FINALISATION_OK=1

if ! sanitise_evidence; then
  echo "Evidence sanitisation failed." >&2
  OVERALL_FAILURE=1
  FINALISATION_OK=0
fi

if [[ "$FINALISATION_OK" -eq 1 ]]; then
  if ! verify_evidence_safety; then
    echo "Evidence safety verification failed." >&2
    OVERALL_FAILURE=1
    FINALISATION_OK=0
  fi
fi

if [[ "$FINALISATION_OK" -eq 1 ]]; then
  if ! create_manifest; then
    echo "Evidence manifest generation failed." >&2
    OVERALL_FAILURE=1
    FINALISATION_OK=0
  fi
fi

if [[ "$FINALISATION_OK" -eq 1 ]]; then
  touch "$EVIDENCE_DIR/.safe-to-upload"
else
  rm -f     "$EVIDENCE_DIR/evidence-manifest.sha256"     "$EVIDENCE_DIR/.safe-to-upload"

  write_summary
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "evidence_dir=$EVIDENCE_DIR" >> "$GITHUB_OUTPUT"
fi

echo
echo "Evidence directory: $EVIDENCE_DIR"

if [[ "$OVERALL_FAILURE" -ne 0 ]]; then
  echo "PR validation result: FAIL"
  exit 1
fi

echo "PR validation result: PASS"
exit 0
