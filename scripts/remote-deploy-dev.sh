#!/usr/bin/env bash
#
# remote-deploy-dev.sh — runs ON the test / nibdev host (pod1.nibdev.com).
#
# Same layout as historical ./deploy.sh:
#   - path: /opt/MLM_Front (unchanged)
#   - compose: docker-compose.prod.yml
#   - container: mlm_front_prod
#   - publish host port APP_PORT (default 3000)
#   - no host nginx install — only the docker network name "nginx" that compose requires
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/MLM_Front}"
STATE_DIR="${PROJECT_DIR}/.cd-state"
STATUS_FILE="${STATE_DIR}/deploy-status"
LOG_FILE="${STATE_DIR}/deploy.log"
PID_FILE="${STATE_DIR}/deploy.pid"
LOCK_FILE="${STATE_DIR}/deploy.lock"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
APP_PORT_HOST="${APP_PORT_HOST:-3000}"

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
COMPOSE_FILE=${COMPOSE_FILE}
CONTAINER=mlm_front_prod
APP_PORT=${APP_PORT_HOST}
ZONE=development
UPDATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STARTED_AT=${STARTED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}
EOF
}

fail() {
  local stage="$1"
  local message="$2"
  write_status "${stage}" "failed" "${message}" "${message}"
  echo "[remote-deploy-dev] FAILED at ${stage}: ${message}" >&2
  exit 1
}

sudo_run() {
  if [[ -n "${SUDO_PASS:-}" ]]; then
    echo "${SUDO_PASS}" | sudo -S -p '' "$@"
  else
    sudo "$@"
  fi
}

docker_run() {
  if docker info >/dev/null 2>&1; then
    docker "$@"
  else
    sudo_run docker "$@"
  fi
}

acquire_lock() {
  if [[ -f "${LOCK_FILE}" ]]; then
    local old_pid
    old_pid="$(cat "${LOCK_FILE}" 2>/dev/null || true)"
    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      echo "[remote-deploy-dev] already running (pid ${old_pid})"
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

echo "======== remote-deploy-dev (nibdev) start ${STARTED_AT} sha=${GIT_SHA:-unknown} ========"
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

# Compose file still references external network name "nginx" — create the network only
# (do NOT install/configure host nginx on the test server).
write_status "network" "running" "Ensuring docker network nginx exists"
if ! docker_run network inspect nginx >/dev/null 2>&1; then
  docker_run network create nginx || fail "network" "docker network create nginx failed"
fi

write_status "env" "running" "Patching .env / .env.production (auth URLs + APP_PORT)"
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

[[ -f .env ]] || cp .env.example .env
patch_zone_auth_env .env development
seed_secret .env
set_port .env "${APP_PORT_HOST}"

# docker-compose.prod.yml loads .env.production into the container — keep it in sync with .env
cp .env .env.production

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  if [[ -f docker-compose.yml ]]; then
    echo "Warning: ${COMPOSE_FILE} missing — falling back to docker-compose.yml"
    COMPOSE_FILE="docker-compose.yml"
  else
    fail "env" "no compose file found"
  fi
fi

export GIT_SHA="${GIT_SHA:-unknown}"
export BUILD_TIME="${BUILD_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
export NEXT_PUBLIC_GIT_SHA="${GIT_SHA}"
export NODE_BASE_IMAGE="${NODE_BASE_IMAGE:-mirror.gcr.io/library/node:22-bookworm-slim}"
export APP_ENV=development
export NEXT_PUBLIC_APP_ENV=development
export APP_PORT="${APP_PORT_HOST}"

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

write_status "build" "running" "Replacing containers then building ${COMPOSE_FILE} (port ${APP_PORT_HOST})"

# Clear name conflicts from earlier sync:dev experiments / other compose project names.
# Keep folder /opt/MLM_Front and final names identical to deploy.sh (mlm_front_prod).
echo "--- Stopping previous compose stacks (no rename of project dir)"
compose_run -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
compose_run -f docker-compose.yml down --remove-orphans 2>/dev/null || true
compose_run -p mlm-dev -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
compose_run -p mlm -f docker-compose.yml down --remove-orphans 2>/dev/null || true
compose_run -p mlm -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker_run rm -f mlm_front mlm_front_prod 2>/dev/null || true

set -a
# shellcheck disable=SC1091
source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env | sed 's/\r$//' || true)
set +a
export APP_ENV=development
export NEXT_PUBLIC_APP_ENV=development
export APP_PORT="${APP_PORT_HOST}"
export GIT_SHA NEXT_PUBLIC_GIT_SHA BUILD_TIME NODE_BASE_IMAGE

# Same style as deploy.sh — no custom -p rename
compose_run -f "${COMPOSE_FILE}" --env-file .env up -d --build --remove-orphans \
  || fail "build" "docker compose build/up failed — see ${LOG_FILE}"

compose_run -f "${COMPOSE_FILE}" ps || true

echo "--- health: localhost:${APP_PORT_HOST}"
curl -sI -m 8 "http://127.0.0.1:${APP_PORT_HOST}/" 2>/dev/null | head -10 \
  || echo "Warning: curl http://127.0.0.1:${APP_PORT_HOST}/ failed (container may still be starting)"

APP_URL_VALUE="$(grep -E '^NEXT_PUBLIC_APP_URL=' .env 2>/dev/null | head -1 | cut -d= -f2- || echo 'https://api-club.nibdev.com')"

write_status "done" "done" "Deploy finished. mlm_front_prod :${APP_PORT_HOST}"
echo "======== remote-deploy-dev done ========"
echo ">>> container: mlm_front_prod | host port: ${APP_PORT_HOST} | APP_ENV=development"
echo ">>> SSO callback base: ${APP_URL_VALUE}"
