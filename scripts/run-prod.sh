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

if [ ! -f "$ROOT/.env" ]; then
  if [ -f "$ROOT/.env.production" ]; then
    log "کپی .env.production → .env"
    cp "$ROOT/.env.production" "$ROOT/.env"
  elif [ -f "$ROOT/.env.example" ]; then
    log "کپی .env.example → .env"
    cp "$ROOT/.env.example" "$ROOT/.env"
  else
    log "${YELLOW}هشدار:${NC} فایل .env وجود ندارد"
  fi
fi

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.env"
  set +a
fi

API_URL="${NEXT_PUBLIC_API_BASE_URL:-https://api-club.nibdev.com}"
log "API (build + rewrite): ${API_URL}"
if [ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ]; then
  log "${YELLOW}هشدار:${NC} NEXT_PUBLIC_API_BASE_URL در .env خالی است — از پیش‌فرض compose استفاده می‌شود"
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
  --build-arg "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-https://api-club.nibdev.com}" \
  --build-arg "NEXT_PUBLIC_DATA_SOURCE=${NEXT_PUBLIC_DATA_SOURCE:-api}" \
  --build-arg "NEXT_PUBLIC_API_ENABLED=${NEXT_PUBLIC_API_ENABLED:-}" \
  --build-arg "NEXT_PUBLIC_API_USE_PROXY=${NEXT_PUBLIC_API_USE_PROXY:-}" \
  --build-arg "NEXT_PUBLIC_USER_TOKEN=${NEXT_PUBLIC_USER_TOKEN:-}" \
  --build-arg "NEXT_PUBLIC_JWT_EXPIRATION=${NEXT_PUBLIC_JWT_EXPIRATION:-5m}" \
  --build-arg "NEXT_PUBLIC_JWT_SECRET=${NEXT_PUBLIC_JWT_SECRET:-dd5f3089-40c3-403d-af14-d0c228b05cb4}" \
  --build-arg "NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=${NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET:-7c4c1c50-3230-45bf-9eae-c9b2e401c767}" \
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
