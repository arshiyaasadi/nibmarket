#!/usr/bin/env bash
#
# remote-deploy.sh — runs ON the live host (nibmarket / club.nibmarket.ir).
# Detached-safe: writes stage progress so a closed local terminal does not stop work.
#
# Builds ONLY the production stack (no UI / v2 stack).
#
# Stages: docker → network → env → base_image → build_prod → nginx → ssl → done
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
PROD_PORT="${PROD_PORT:-3002}"
NGINX_DOMAIN="${NGINX_DOMAIN:-club.nibmarket.ir}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

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
PROD_PORT=${PROD_PORT}
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

write_status "env" "running" "Seeding + patching .env.production (auth/SSO URLs)"
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

[[ -f .env.production ]] || { cp .env.production.example .env.production; seed_secret .env.production; }
patch_zone_auth_env .env.production production
set_port .env.production "${PROD_PORT}"
[[ -f .env ]] || cp .env.production .env

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

# Stop legacy UI stack if it still exists (no longer built)
if [[ -f docker-compose.v2.yml ]]; then
  echo "--- Stopping legacy UI stack (mlm-v2) if present"
  compose_run -p mlm-v2 -f docker-compose.v2.yml down --remove-orphans 2>/dev/null || true
fi

write_status "build_prod" "running" "Building production stack on :${PROD_PORT}"
set -a
# shellcheck disable=SC1091
source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env.production | sed 's/\r$//' || true)
set +a
export APP_PORT="${PROD_PORT}"
compose_run -p mlm-prod -f docker-compose.prod.yml --env-file .env.production up -d --build --remove-orphans \
  || fail "build_prod" "docker compose prod build/up failed — see ${LOG_FILE}"

write_status "nginx" "running" "Configuring nginx for ${NGINX_DOMAIN}"
if ! command -v nginx >/dev/null 2>&1; then
  sudo_run apt-get update -y
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y nginx \
    || fail "nginx" "apt install nginx failed"
fi

NGINX_SRC="${PROJECT_DIR}/deploy/nginx/club.nibmarket.ir.conf"
NGINX_AVAIL="/etc/nginx/sites-available/${NGINX_DOMAIN}.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/${NGINX_DOMAIN}.conf"
if [[ ! -f "${NGINX_SRC}" ]]; then
  fail "nginx" "missing ${NGINX_SRC}"
fi

TMP_CONF="$(mktemp)"
sed \
  -e "s/__PROD_PORT__/${PROD_PORT}/g" \
  -e "s/__UI_PORT__/3003/g" \
  -e "s/__DOMAIN__/${NGINX_DOMAIN}/g" \
  "${NGINX_SRC}" > "${TMP_CONF}"
sudo_run cp "${TMP_CONF}" "${NGINX_AVAIL}"
rm -f "${TMP_CONF}"
sudo_run ln -sfn "${NGINX_AVAIL}" "${NGINX_ENABLED}"
sudo_run rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo_run nginx -t || fail "nginx" "nginx -t failed"
sudo_run systemctl enable --now nginx
sudo_run systemctl reload nginx || sudo_run systemctl restart nginx

write_status "ssl" "running" "Ensuring HTTPS for ${NGINX_DOMAIN}"
if command -v certbot >/dev/null 2>&1 || sudo_run apt-get install -y certbot python3-certbot-nginx; then
  if [[ -n "${CERTBOT_EMAIL}" ]]; then
    sudo_run certbot --nginx -d "${NGINX_DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" --redirect \
      || echo "Warning: certbot failed — HTTP still works; fix DNS/80 then re-run"
  else
    if [[ ! -d "/etc/letsencrypt/live/${NGINX_DOMAIN}" ]]; then
      sudo_run certbot --nginx -d "${NGINX_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect \
        || echo "Warning: certbot failed — HTTP proxy is up on :80; run certbot manually for HTTPS"
    else
      sudo_run certbot renew --quiet || true
      sudo_run nginx -t && sudo_run systemctl reload nginx || true
    fi
  fi
else
  echo "Warning: certbot not available — HTTP only"
fi

compose_run -p mlm-prod -f docker-compose.prod.yml ps || true

write_status "done" "done" "Deploy finished. prod :${PROD_PORT} | https://${NGINX_DOMAIN} (UI stack skipped)"
echo "======== remote-deploy done ========"
echo ">>> prod :${PROD_PORT} | nginx ${NGINX_DOMAIN} | UI stack not built"
