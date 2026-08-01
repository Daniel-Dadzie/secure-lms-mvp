#!/usr/bin/env bash

# Secure LMS — Local Security Check Runner
#
# This compatibility entry point delegates to the reusable PR-validation
# runner so that local and CI security policies cannot drift apart.
#
# Usage:
#   ./run_security_checks.sh

set -euo pipefail

REPOSITORY_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")" &&
  pwd
)"

exec \
  "$REPOSITORY_ROOT/scripts/ci/run_pr_validation.sh" \
  security
