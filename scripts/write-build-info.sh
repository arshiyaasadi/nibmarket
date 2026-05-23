#!/usr/bin/env sh
# Writes public/build-info.json for /version page (run before next build).
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GIT_COMMIT="${GIT_COMMIT:-unknown}"
BUILD_TIME="${BUILD_TIME:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"
APP_ENV="${APP_ENV:-production}"

if [ -z "${APP_VERSION:-}" ]; then
  if command -v node >/dev/null 2>&1; then
    APP_VERSION="$(node -p "require('./package.json').version")"
  else
    APP_VERSION="unknown"
  fi
fi

mkdir -p public

# shellcheck disable=SC2086
node -e "
const fs = require('fs');
const info = {
  version: process.env.APP_VERSION,
  gitCommit: process.env.GIT_COMMIT,
  gitCommitFull: process.env.GIT_COMMIT_FULL || process.env.GIT_COMMIT,
  buildTime: process.env.BUILD_TIME,
  environment: process.env.APP_ENV,
  nodeEnv: process.env.APP_ENV === 'production' ? 'production' : 'development'
};
fs.writeFileSync('public/build-info.json', JSON.stringify(info, null, 2) + '\n');
" \
  APP_VERSION="$APP_VERSION" \
  GIT_COMMIT="$GIT_COMMIT" \
  GIT_COMMIT_FULL="${GIT_COMMIT_FULL:-$GIT_COMMIT}" \
  BUILD_TIME="$BUILD_TIME" \
  APP_ENV="$APP_ENV"

echo "Wrote public/build-info.json (${APP_ENV}, ${APP_VERSION}, ${GIT_COMMIT})"
