#!/usr/bin/env bash

#
# Secure LMS — Local Security Check Runner
#
# Runs the same three checks as the CI "Security Pipeline" (.github/workflows/security.yml)
# locally, on your machine, before you push — and logs every run with a timestamp so you
# have a history to point to.
#
# Repo layout: npm workspaces monorepo — root package.json/package-lock.json,
# with workspaces at client/, server/, and packages/shared/. Dependency scans
# run from the repo root against each workspace, not inside each folder,
# because there is only one lockfile for the whole repo.
#
# Usage:
#   chmod +x run_security_checks.sh
#   ./run_security_checks.sh
#
# Run this from the REPOSITORY ROOT (the folder that contains client/, server/,
# packages/shared/, and the root package.json).


set -uo pipefail

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="security-logs"
LOG_FILE="$LOG_DIR/security-check_$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

BLOCKING_FAILURE=0
INCOMPLETE=0

log() {
  echo "$1" | tee -a "$LOG_FILE"
}

section() {
  log ""
  log "=================================================="
  log "$1"
  log "=================================================="
}

require_repo_root() {
  local missing=0

  for path in package.json package-lock.json client server packages/shared; do
    if [ ! -e "$path" ]; then
      log "Missing required repository path: $path"
      missing=1
    fi
  done

  if [ "$missing" -ne 0 ]; then
    log "Run this script from the Secure LMS repository root."
    exit 2
  fi
}

require_repo_root

section "Secure LMS Security Check - $TIMESTAMP"

section "1. Secret Scan - Gitleaks"

if command -v gitleaks >/dev/null 2>&1; then
  if gitleaks detect \
      --source . \
      --config .gitleaks.toml \
      --redact \
      --verbose \
      2>&1 | tee -a "$LOG_FILE"; then

    log "👍 RESULT: Gitleaks PASSED."
  else
    log "❌ RESULT: Gitleaks FAILED - potential secret detected."
    BLOCKING_FAILURE=1
  fi
else
  log "❌ RESULT: INCOMPLETE - Gitleaks is not installed."
  log "Install from the official Gitleaks releases or package manager."
  INCOMPLETE=1
fi

section "2. Dependency Scanning - npm audit"

for WORKSPACE in client server packages/shared; do
  log ""
  log "Workspace: $WORKSPACE"

  npm audit \
    --workspace="$WORKSPACE" \
    --omit=dev \
    --audit-level=high \
    --package-lock-only \
    2>&1 | tee -a "$LOG_FILE"

  AUDIT_EXIT=${PIPESTATUS[0]}

  if [ "$AUDIT_EXIT" -eq 0 ]; then
    log "👍 RESULT: $WORKSPACE audit PASSED."
  else
    log "❌ RESULT: $WORKSPACE audit FAILED."
    BLOCKING_FAILURE=1
  fi
done

section "3. Static Analysis - Semgrep"

if command -v semgrep >/dev/null 2>&1; then
  semgrep scan \
    --config p/owasp-top-ten \
    --config p/javascript \
    --config p/typescript \
    --config p/expressjs \
    --config p/react \
    --error \
    . \
    2>&1 | tee -a "$LOG_FILE"

  SEMGREP_EXIT=${PIPESTATUS[0]}

  if [ "$SEMGREP_EXIT" -eq 0 ]; then
    log "👍 RESULT: Semgrep completed with no blocking result."
  else
    log "⚠️ RESULT: Semgrep findings detected."
    log "Week 1-2 policy: findings are logged for review but remain non-blocking."
  fi
else
  log "❌ RESULT: INCOMPLETE - Semgrep is not installed."
  log "Install with an approved package manager or Python environment."
  INCOMPLETE=1
fi

section "Final Result"

if [ "$BLOCKING_FAILURE" -ne 0 ]; then
  log "❌ OVERALL: FAIL"
  log "One or more blocking security findings were detected."
  log "Review the log, record findings and remediate before submission."
  log "Log file: $LOG_FILE"
  exit 1
fi

if [ "$INCOMPLETE" -ne 0 ]; then
  log "⚠️ OVERALL: INCOMPLETE"
  log "One or more required security checks did not run."
  log "Install the missing tools and rerun the script."
  log "Log file: $LOG_FILE"
  exit 2
fi

log "✅ OVERALL: PASS"
log "All mandatory checks completed without blocking findings."
log "Log file: $LOG_FILE"
exit 0
