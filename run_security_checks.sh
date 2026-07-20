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

PASS=1

log() { echo "$1" | tee -a "$LOG_FILE"; }

log "=================================================="
log "Secure LMS — Security Check Run: $TIMESTAMP"
log "=================================================="

# ---------------------------------------------------------------
# 1. Secret scanning (Gitleaks)
# ---------------------------------------------------------------
log ""
log "---- 1. Secret Scan (Gitleaks) ----"
if command -v gitleaks &> /dev/null; then
  if gitleaks detect --source . --config .gitleaks.toml --redact -v 2>&1 | tee -a "$LOG_FILE"; then
    log "RESULT: Gitleaks PASSED — no secrets found."
  else
    log "RESULT: Gitleaks FAILED — secret(s) detected. See details above."
    PASS=0
  fi
else
  log "SKIPPED — gitleaks is not installed."
  log "  macOS:   brew install gitleaks"
  log "  Linux:   see https://github.com/gitleaks/gitleaks#installing"
fi

# ---------------------------------------------------------------
# 2. Dependency scanning (npm audit) — client, server, packages/shared
#    workspaces, run from the repo root against the single root lockfile.
# ---------------------------------------------------------------
if [ ! -f "package-lock.json" ]; then
  log ""
  log "---- 2. Dependency Scan (npm audit) ----"
  log "SKIPPED — no package-lock.json at repo root. Run this script from the repo root."
else
  for WORKSPACE in client server packages/shared; do
    log ""
    log "---- 2. Dependency Scan: $WORKSPACE (npm audit) ----"
    if [ -d "$WORKSPACE" ]; then
      npm audit --workspace="$WORKSPACE" --omit=dev --audit-level=high 2>&1 | tee -a "$LOG_FILE"
      AUDIT_EXIT=${PIPESTATUS[0]}
      if [ "$AUDIT_EXIT" -eq 0 ]; then
        log "RESULT: $WORKSPACE npm audit PASSED."
      else
        log "RESULT: $WORKSPACE npm audit FAILED — high/critical vulnerability found."
        PASS=0
      fi
    else
      log "SKIPPED — $WORKSPACE/ folder not found at repo root."
    fi
  done
fi

# ---------------------------------------------------------------
# 3. Static analysis (Semgrep) — non-blocking in Week 1-2, matches CI
# ---------------------------------------------------------------
log ""
log "---- 3. Static Analysis (Semgrep) ----"
if command -v semgrep &> /dev/null; then
  semgrep --config p/owasp-top-ten --config p/javascript --config p/typescript \
          --config p/expressjs --config p/react . 2>&1 | tee -a "$LOG_FILE"
  log "RESULT: Semgrep findings logged above — non-blocking this cycle, review manually."
else
  log "SKIPPED — semgrep is not installed."
  log "  Install: pip install semgrep --break-system-packages   (or: brew install semgrep)"
fi

# ---------------------------------------------------------------
# Summary
# ---------------------------------------------------------------
log ""
log "=================================================="
if [ "$PASS" -eq 1 ]; then
  log "OVERALL: PASS — no blocking findings."
else
  log "OVERALL: FAIL — one or more blocking checks failed. See log for details."
fi
log "Full log saved to: $LOG_FILE"
log "=================================================="

exit $((1 - PASS))
