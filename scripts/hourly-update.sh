#!/usr/bin/env bash
# Hourly auto-update step (GitHub Pages).
# Assumes the hourly Claude session has written a fresh batch to
# scripts/_batch.json following the content rules in README.md.
#
# Required env (provided by the scheduled task):
#   GITHUB_TOKEN   GitHub PAT with Contents: read/write on the repo
#   GIT_REMOTE     https remote, e.g. https://github.com/<user>/lingotrio.git
#
# Usage: bash scripts/hourly-update.sh [batch.json]
set -euo pipefail
cd "$(dirname "$0")/.."

BATCH="${1:-scripts/_batch.json}"

echo "[hourly] append batch"
node scripts/append-batch.mjs "$BATCH"

echo "[hourly] install + build (verify before publishing)"
npm ci || npm install
npm run build

echo "[hourly] commit + push (GitHub Actions will deploy)"
git add -A
if git diff --cached --quiet; then
  echo "[hourly] no new content — nothing to publish"
  exit 0
fi
git -c user.name="LingoTrio Bot" -c user.email="bot@lingotrio.local" \
    commit -m "chore(content): hourly auto-update batch"
if [[ -n "${GITHUB_TOKEN:-}" && -n "${GIT_REMOTE:-}" ]]; then
  AUTH_REMOTE="${GIT_REMOTE/https:\/\//https:\/\/x-access-token:${GITHUB_TOKEN}@}"
  git push "$AUTH_REMOTE" HEAD:main
  echo "[hourly] pushed — deploy will run on GitHub"
else
  echo "[hourly] GITHUB_TOKEN/GIT_REMOTE not set; committed locally only"
fi
