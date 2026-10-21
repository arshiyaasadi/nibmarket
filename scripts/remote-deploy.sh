#!/usr/bin/env bash
#
# remote-deploy.sh — runs ON the live host (nibmarket / club.nibmarket.com).
# Detached-safe: writes stage progress so a closed local terminal does not stop work.
#
# Builds ONLY the live stack (docker-compose.live.yml).
#
# Stages: docker → network → env → base_image → build_live → nginx → ssl → done
#
# Usage (on server):
#   PROJECT_DIR=/opt/MLM_Front GIT_SHA=abc BUILD_TIME=... bash scripts/remote-deploy.sh
#   bash scripts/remote-deploy.sh --status
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/MLM_Front}"
STATE_DIR="${PROJECT_DIR}/.cd-state"
STATUS_FILE="${STATE_DIR}/deploy-status"
LOG_FILE="${STATE_DIR}/deploy.log"
PID_FILE="${STATE_DIR}/deploy.pid"
LOCK_FILE="${STATE_DIR}/deploy.lock"
LIVE_PORT="${LIVE_PORT:-${PROD_PORT:-3000}}"
NGINX_DOMAIN="${NGINX_DOMAIN:-club.nibmarket.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
# ArvanCloud (public HTTPS) → this host :80 → app :3000.
# Always (re)write HTTP-only origin nginx; never run certbot (would 301-loop the CDN).
SKIP_NGINX="${SKIP_NGINX:-0}"
COMPOSE_FILE="docker-compose.live.yml"
COMPOSE_PROJECT="mlm-live"
ENV_FILE=".env.live"

cd "${PROJECT_DIR}"
mkdir -p "${STATE_DIR}"

# shellcheck disable=SC1091
source "${PROJECT_DIR}/scripts/lib/patch-auth-env.sh"

if [[ "${1:-}" == "--status" ]]; then
  if [[ -f "${STATUS_FILE}" ]]; then
    cat "${STATUS_FILE}"
  else
    echo "STATUS=idle"
    echo "STAGE=none"
    echo "MESSAGE=no deploy has run yet"
  fi
  exit 0
fi

write_status() {
  local stage="$1"
  local status="$2"
  local message="${3:-}"
  local err="${4:-}"
  cat > "${STATUS_FILE}" <<EOF
STATUS=${status}
STAGE=${stage}
MESSAGE=${message}
ERROR=${err}
PID=$$
GIT_SHA=${GIT_SHA:-unknown}
BUILD_TIME=${BUILD_TIME:-}
LIVE_PORT=${LIVE_PORT}
NGINX_DOMAIN=${NGINX_DOMAIN}
UPDATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STARTED_AT=${STARTED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}
EOF
}

fail() {
  local stage="$1"
  local message="$2"
  write_status "${stage}" "failed" "${message}" "${message}"
  echo "[remote-deploy] FAILED at ${stage}: ${message}" >&2
  exit 1
}

sudo_run() {
  if [[ -n "${SUDO_PASS:-}" ]]; then
    echo "${SUDO_PASS}" | sudo -S -p '' "$@"
  else
    sudo "$@"
  fi
}

acquire_lock() {
  if [[ -f "${LOCK_FILE}" ]]; then
    local old_pid
    old_pid="$(cat "${LOCK_FILE}" 2>/dev/null || true)"
    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      echo "[remote-deploy] already running (pid ${old_pid})"
      exit 0
    fi
  fi
  echo $$ > "${LOCK_FILE}"
  echo $$ > "${PID_FILE}"
  trap 'rm -f "${LOCK_FILE}"' EXIT
}

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
acquire_lock

: > "${LOG_FILE}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "======== remote-deploy (LIVE) start ${STARTED_AT} sha=${GIT_SHA:-unknown} ========"
write_status "docker" "running" "Ensuring Docker is installed"

if ! command -v docker >/dev/null 2>&1; then
  write_status "docker" "running" "Installing docker.io via apt"
  sudo_run apt-get update -y
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 \
    || sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose \
    || fail "docker" "apt install docker failed"
fi
if ! command -v docker >/dev/null 2>&1; then
  fail "docker" "docker binary missing after install"
fi
if getent group docker >/dev/null 2>&1; then
  sudo_run usermod -aG docker "$(whoami)" || true
fi
sudo_run systemctl enable --now docker 2>/dev/null || true

compose_run() {
  if docker info >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif docker compose version >/dev/null 2>&1; then
    sudo_run docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      docker-compose "$@"
    else
      sudo_run docker-compose "$@"
    fi
  else
    fail "docker" "no compose binary"
  fi
}

write_status "network" "running" "Ensuring docker network nginx"
if ! sudo_run docker network inspect nginx >/dev/null 2>&1; then
  sudo_run docker network create nginx || fail "network" "docker network create nginx failed"
fi

write_status "env" "running" "Seeding + patching ${ENV_FILE} (auth/SSO URLs)"
seed_secret() {
  local file="$1"
  if grep -q 'AUTH_SECRET=<generate' "${file}" 2>/dev/null || grep -qE '^AUTH_SECRET=$' "${file}" 2>/dev/null; then
    SECRET="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p | tr -d '\n' | head -c 48)"
    sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" "${file}" && rm -f "${file}.bak"
  fi
}

set_port() {
  local file="$1"
  local port="$2"
  if grep -qE '^APP_PORT=' "${file}" 2>/dev/null; then
    sed -i.bak "s|^APP_PORT=.*|APP_PORT=${port}|" "${file}" && rm -f "${file}.bak"
  else
    echo "APP_PORT=${port}" >> "${file}"
  fi
}

# Migrate legacy env filename if present
if [[ ! -f "${ENV_FILE}" && -f .env.production ]]; then
  cp .env.production "${ENV_FILE}"
  echo "--- Migrated .env.production → ${ENV_FILE}"
fi

[[ -f "${ENV_FILE}" ]] || { cp .env.live.example "${ENV_FILE}"; seed_secret "${ENV_FILE}"; }
patch_zone_auth_env "${ENV_FILE}" production
set_port "${ENV_FILE}" "${LIVE_PORT}"
# LIVE_UI_MOCK=1 → mock BFF + UI-dev auth bypass (for UI review on live host).
# Default live path always clears mock flags so production talks to club BE.
if [[ "${LIVE_UI_MOCK:-0}" == "1" ]]; then
  echo "--- LIVE_UI_MOCK=1 → enabling FORCE_UI_DEV_MODE + API_SERVICE_MODE=mock"
  patch_live_ui_mock_env "${ENV_FILE}"
else
  echo "--- clearing UI mock flags (real API: club-srv)"
  clear_live_ui_mock_env "${ENV_FILE}"
fi
[[ -f .env ]] || cp "${ENV_FILE}" .env

export GIT_SHA="${GIT_SHA:-unknown}"
export BUILD_TIME="${BUILD_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
export NEXT_PUBLIC_GIT_SHA="${GIT_SHA}"
export NODE_BASE_IMAGE="${NODE_BASE_IMAGE:-mirror.gcr.io/library/node:22-bookworm-slim}"

write_status "base_image" "running" "Pulling ${NODE_BASE_IMAGE}"
pull_base() {
  if docker info >/dev/null 2>&1; then
    docker pull "$1"
  else
    sudo_run docker pull "$1"
  fi
}
if ! pull_base "${NODE_BASE_IMAGE}"; then
  pulled=0
  for alt in \
    "docker.arvancloud.ir/library/node:22-bookworm-slim" \
    "registry.docker.ir/library/node:22-bookworm-slim" \
    "node:22-bookworm-slim"
  do
    echo "--- retry base image: ${alt}"
    if pull_base "${alt}"; then
      export NODE_BASE_IMAGE="${alt}"
      pulled=1
      break
    fi
  done
  [[ "${pulled}" -eq 1 ]] || fail "base_image" "could not pull any node base image"
fi
echo "--- Using NODE_BASE_IMAGE=${NODE_BASE_IMAGE}"

# Stop legacy stacks / containers if present
echo "--- Stopping legacy stacks if present"
compose_run -p mlm-v2 -f docker-compose.v2.yml down --remove-orphans 2>/dev/null || true
compose_run -p mlm-prod -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
if docker info >/dev/null 2>&1; then
  docker rm -f mlm_front_v2 mlm_front_prod mlm_front 2>/dev/null || true
else
  sudo_run docker rm -f mlm_front_v2 mlm_front_prod mlm_front 2>/dev/null || true
fi

write_status "build_live" "running" "Building live stack on :${LIVE_PORT}"
set -a
# shellcheck disable=SC1091
# Export build-time public flags so compose ${VAR} interpolation + Dockerfile ARGs see them
source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT|FORCE_UI_DEV_MODE|NEXT_PUBLIC_FORCE_UI_DEV_MODE|NEXT_PUBLIC_UI_DEV_MODE|API_SERVICE_MODE)=' "${ENV_FILE}" | sed 's/\r$//' || true)
set +a
export APP_PORT="${LIVE_PORT}"
compose_run -p "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --build --remove-orphans \
  || fail "build_live" "docker compose live build/up failed — see ${LOG_FILE}"

# Smoke: app must answer on host :LIVE_PORT (edge proxies here)
if curl -sf -o /dev/null --max-time 8 "http://127.0.0.1:${LIVE_PORT}/build-info.json"; then
  echo "--- app OK on 127.0.0.1:${LIVE_PORT}/build-info.json"
else
  echo "Warning: app not answering on 127.0.0.1:${LIVE_PORT}/build-info.json yet"
fi

if [[ "${SKIP_NGINX}" == "1" ]]; then
  echo "--- SKIP_NGINX=1 → not touching host nginx"
  compose_run -p "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" ps || true
  write_status "done" "done" "Deploy finished. live :${LIVE_PORT} (SKIP_NGINX)"
  echo "======== remote-deploy done ========"
  echo ">>> live container :${LIVE_PORT} | SKIP_NGINX=1"
  exit 0
fi

write_status "nginx" "running" "CDN origin nginx :80 → :${LIVE_PORT} (no certbot)"
if ! command -v nginx >/dev/null 2>&1; then
  sudo_run apt-get update -y
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y nginx \
    || fail "nginx" "apt install nginx failed"
fi

NGINX_SRC="${PROJECT_DIR}/deploy/nginx/club.nibmarket.com.conf"
NGINX_AVAIL="/etc/nginx/sites-available/${NGINX_DOMAIN}.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/${NGINX_DOMAIN}.conf"
NGINX_UPSTREAM="mlm_front_live_${NGINX_DOMAIN//./_}"
NGINX_EXTRA_NAMES="${NGINX_EXTRA_SERVER_NAMES:-club-docker.nibmarket.com}"
if [[ ! -f "${NGINX_SRC}" ]]; then
  fail "nginx" "missing ${NGINX_SRC}"
fi

# Drop every other vhost (legacy .ir, novina, default, …)
echo "--- nginx: sole origin vhost ${NGINX_DOMAIN}.conf → 127.0.0.1:${LIVE_PORT}"
if [[ -d /etc/nginx/sites-enabled ]]; then
  for enabled in /etc/nginx/sites-enabled/*; do
    [[ -e "${enabled}" ]] || continue
    base="$(basename "${enabled}")"
    if [[ "${base}" != "${NGINX_DOMAIN}.conf" ]]; then
      echo "--- disabling competing site: ${base}"
      sudo_run rm -f "${enabled}"
    fi
  done
fi

# Overwrite completely — wipes leftover certbot listen 443 / return 301 https (CDN loop)
TMP_CONF="$(mktemp)"
sed \
  -e "s/__LIVE_PORT__/${LIVE_PORT}/g" \
  -e "s/__PROD_PORT__/${LIVE_PORT}/g" \
  -e "s/__DOMAIN__/${NGINX_DOMAIN}/g" \
  -e "s/__UPSTREAM__/${NGINX_UPSTREAM}/g" \
  -e "s/__EXTRA_SERVER_NAMES__/${NGINX_EXTRA_NAMES}/g" \
  "${NGINX_SRC}" > "${TMP_CONF}"
sudo_run cp "${TMP_CONF}" "${NGINX_AVAIL}"
rm -f "${TMP_CONF}"
sudo_run ln -sfn "${NGINX_AVAIL}" "${NGINX_ENABLED}"

# Disable certbot renew for this domain if present (do not re-inject SSL into our vhost)
if [[ -d /etc/letsencrypt/renewal ]]; then
  for renew in /etc/letsencrypt/renewal/"${NGINX_DOMAIN}".conf /etc/letsencrypt/renewal/"${NGINX_DOMAIN}"-*.conf; do
    if [[ -f "${renew}" ]]; then
      echo "--- disabling certbot renewal: ${renew}"
      sudo_run mv "${renew}" "${renew}.disabled-cdn-origin" 2>/dev/null || true
    fi
  done
fi

sudo_run nginx -t || fail "nginx" "nginx -t failed"
sudo_run systemctl enable --now nginx
sudo_run systemctl reload nginx || sudo_run systemctl restart nginx

# Origin smoke: must be 200 (not 301) so ArvanCloud does not loop
ORIGIN_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 -H "Host: ${NGINX_DOMAIN}" "http://127.0.0.1/build-info.json" || echo 000)"
echo "--- origin check Host=${NGINX_DOMAIN} http://127.0.0.1/build-info.json → HTTP ${ORIGIN_CODE}"
if [[ "${ORIGIN_CODE}" != "200" ]]; then
  fail "nginx" "origin expected HTTP 200, got ${ORIGIN_CODE} (301 means leftover HTTPS redirect — CDN will loop)"
fi

compose_run -p "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" ps || true

write_status "done" "done" "Deploy finished. live :${LIVE_PORT} | origin :80 → app (CDN: https://${NGINX_DOMAIN})"
echo "======== remote-deploy done ========"
echo ">>> live :${LIVE_PORT} | nginx HTTP origin for ${NGINX_DOMAIN} (no certbot)"
echo ">>> CDN https://${NGINX_DOMAIN} → this host :80 → :${LIVE_PORT}"
echo ">>> local origin OK: HTTP ${ORIGIN_CODE} for /build-info.json"
