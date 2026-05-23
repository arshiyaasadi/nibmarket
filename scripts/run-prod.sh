#!/usr/bin/env bash
# Build and start production stack (docker compose), then print status.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${SERVICE:-app}"
PORT="${APP_PORT:-3000}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
MAX_WAIT_SEC="${MAX_WAIT_SEC:-120}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  printf '%s\n' "[run-prod] $*"
}

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH" >&2
  exit 1
fi

if [ ! -f "$ROOT/.env" ] && [ -f "$ROOT/.env.example" ]; then
  log "${YELLOW}هشدار:${NC} فایل .env وجود ندارد — از .env.example کپی کنید: cp .env.example .env"
fi

GIT_COMMIT="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
GIT_COMMIT_FULL="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
APP_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo unknown)"
APP_ENV=production

export GIT_COMMIT GIT_COMMIT_FULL BUILD_TIME APP_VERSION APP_ENV

log "بیلد production (نسخه=${APP_VERSION}, commit=${GIT_COMMIT}, زمان=${BUILD_TIME})..."

docker compose -f "$COMPOSE_FILE" build \
  --build-arg "GIT_COMMIT=${GIT_COMMIT}" \
  --build-arg "GIT_COMMIT_FULL=${GIT_COMMIT_FULL}" \
  --build-arg "BUILD_TIME=${BUILD_TIME}" \
  --build-arg "APP_VERSION=${APP_VERSION}" \
  --build-arg "APP_ENV=${APP_ENV}" \
  "$SERVICE"

log "اجرای کانتینر..."
docker compose -f "$COMPOSE_FILE" up -d

log "منتظر آماده‌شدن سرویس (${MAX_WAIT_SEC}s) — ${BASE_URL}/api/version"

deadline=$((SECONDS + MAX_WAIT_SEC))
ready=0

while [ "$SECONDS" -lt "$deadline" ]; do
  if curl -sf "${BASE_URL}/api/version" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

echo ""
echo "════════════════════════════════════════"
echo "  وضعیت Docker Compose (production)"
echo "════════════════════════════════════════"
docker compose -f "$COMPOSE_FILE" ps
echo ""

if [ "$ready" -eq 1 ]; then
  echo -e "${GREEN}✓ سرویس بالا است${NC}"
  echo "  اپ:        ${BASE_URL}/"
  echo "  نسخه:      ${BASE_URL}/version"
  echo ""
  echo "── اطلاعات نسخه (API) ──"
  if command -v python3 >/dev/null 2>&1; then
    curl -sf "${BASE_URL}/api/version" | python3 -m json.tool 2>/dev/null || curl -sf "${BASE_URL}/api/version"
  else
    curl -sf "${BASE_URL}/api/version"
  fi
  echo ""
  exit 0
fi

echo -e "${RED}✗ سرویس در ${MAX_WAIT_SEC} ثانیه پاسخ نداد${NC}"
echo ""
echo "── آخرین لاگ‌ها ──"
docker compose -f "$COMPOSE_FILE" logs --tail=50 "$SERVICE" || true
exit 1
