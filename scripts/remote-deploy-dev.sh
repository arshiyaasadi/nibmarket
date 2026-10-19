#!/usr/bin/env bash
#
# remote-deploy-dev.sh — runs ON the nibdev host (pod1.nibdev.com).
#
# Blue/green:
#   - active slot → host :3000 (public)
#   - standby slot → 127.0.0.1:2999 (localhost only, not public)
#   - containers: mlm_front_dev_blue | mlm_front_dev_green
#
# Usage (on server):
#   bash scripts/remote-deploy-dev.sh           # build inactive → health → swap
#   bash scripts/remote-deploy-dev.sh --rollback
#   bash scripts/remote-deploy-dev.sh --status
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/MLM_Front}"
STATE_DIR="${PROJECT_DIR}/.cd-state"
STATUS_FILE="${STATE_DIR}/deploy-status"
SLOT_FILE="${STATE_DIR}/slot-state"
LOG_FILE="${STATE_DIR}/deploy.log"
PID_FILE="${STATE_DIR}/deploy.pid"
LOCK_FILE="${STATE_DIR}/deploy.lock"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.dev.yml}"
COMPOSE_PROJECT="mlm-dev"
PUBLIC_PORT="${APP_PORT_HOST:-3000}"
STANDBY_BIND="127.0.0.1:2999"

cd "${PROJECT_DIR}"
mkdir -p "${STATE_DIR}"

# shellcheck disable=SC1091
source "${PROJECT_DIR}/scripts/lib/patch-auth-env.sh"

# ── helpers ────────────────────────────────────────────────────

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
    echo "[remote-deploy-dev] no compose binary" >&2
    exit 1
  fi
}

other_slot() {
  if [[ "$1" == "blue" ]]; then echo green; else echo blue; fi
}

service_name() {
  echo "app_$1"
}

container_name() {
  echo "mlm_front_dev_$1"
}

port_spec_public() {
  echo "${PUBLIC_PORT}:3000"
}

port_spec_standby() {
  echo "${STANDBY_BIND}:3000"
}

load_slot_state() {
  ACTIVE_SLOT="blue"
  if [[ -f "${SLOT_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${SLOT_FILE}"
    ACTIVE_SLOT="${ACTIVE:-blue}"
  fi
  if [[ "${ACTIVE_SLOT}" != "blue" && "${ACTIVE_SLOT}" != "green" ]]; then
    ACTIVE_SLOT="blue"
  fi
  INACTIVE_SLOT="$(other_slot "${ACTIVE_SLOT}")"
}

write_slot_state() {
  local active="$1"
  local blue_pub green_pub
  if [[ "${active}" == "blue" ]]; then
    blue_pub="$(port_spec_public)"
    green_pub="$(port_spec_standby)"
  else
    blue_pub="$(port_spec_standby)"
    green_pub="$(port_spec_public)"
  fi
  cat > "${SLOT_FILE}" <<EOF
ACTIVE=${active}
BLUE_PUBLISH=${blue_pub}
GREEN_PUBLISH=${green_pub}
UPDATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
  export ACTIVE="${active}"
  export BLUE_PORT_SPEC="${blue_pub}"
  export GREEN_PORT_SPEC="${green_pub}"
  ACTIVE_SLOT="${active}"
  INACTIVE_SLOT="$(other_slot "${active}")"
}

apply_port_env_from_state() {
  load_slot_state
  if [[ "${ACTIVE_SLOT}" == "blue" ]]; then
    export BLUE_PORT_SPEC
    BLUE_PORT_SPEC="$(port_spec_public)"
    export GREEN_PORT_SPEC
    GREEN_PORT_SPEC="$(port_spec_standby)"
  else
    export BLUE_PORT_SPEC
    BLUE_PORT_SPEC="$(port_spec_standby)"
    export GREEN_PORT_SPEC
    GREEN_PORT_SPEC="$(port_spec_public)"
  fi
}

container_running() {
  local name
  name="$(container_name "$1")"
  docker_run inspect -f '{{.State.Running}}' "${name}" 2>/dev/null | grep -qx true
}

write_status() {
  local stage="$1"
  local status="$2"
  local message="${3:-}"
  local err="${4:-}"
  load_slot_state 2>/dev/null || true
  cat > "${STATUS_FILE}" <<EOF
STATUS=${status}
STAGE=${stage}
MESSAGE=${message}
ERROR=${err}
PID=$$
GIT_SHA=${GIT_SHA:-unknown}
BUILD_TIME=${BUILD_TIME:-}
COMPOSE_FILE=${COMPOSE_FILE}
ACTIVE_SLOT=${ACTIVE_SLOT:-unknown}
INACTIVE_SLOT=${INACTIVE_SLOT:-unknown}
ACTIVE_CONTAINER=$(container_name "${ACTIVE_SLOT:-blue}")
STANDBY_CONTAINER=$(container_name "${INACTIVE_SLOT:-green}")
PUBLIC_PORT=${PUBLIC_PORT}
STANDBY_BIND=${STANDBY_BIND}
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

health_check() {
  local url="$1"
  local tries="${2:-20}"
  local i
  for ((i = 1; i <= tries; i++)); do
    if curl -sfI -m 5 "${url}" >/dev/null 2>&1; then
      echo "--- health OK (${url}) attempt ${i}"
      return 0
    fi
    sleep 2
  done
  return 1
}

export_build_env() {
  export GIT_SHA="${GIT_SHA:-unknown}"
  export BUILD_TIME="${BUILD_TIME:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
  export NEXT_PUBLIC_GIT_SHA="${GIT_SHA}"
  export NODE_BASE_IMAGE="${NODE_BASE_IMAGE:-mirror.gcr.io/library/node:22-bookworm-slim}"
  export APP_ENV=development
  export NEXT_PUBLIC_APP_ENV=development
  export APP_PORT="${PUBLIC_PORT}"
}

compose_with_ports() {
  # Pass port specs into compose
  BLUE_PORT_SPEC="${BLUE_PORT_SPEC}" GREEN_PORT_SPEC="${GREEN_PORT_SPEC}" \
    compose_run -p "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" --env-file .env "$@"
}

recreate_ports_only() {
  # Recreate containers with current BLUE/GREEN_PORT_SPEC (no rebuild)
  compose_with_ports up -d --no-build --no-deps "$(service_name blue)" "$(service_name green)" \
    || compose_with_ports up -d --no-build "$(service_name "${ACTIVE_SLOT}")"
}

# ── --status ───────────────────────────────────────────────────

if [[ "${1:-}" == "--status" ]]; then
  if [[ -f "${STATUS_FILE}" ]]; then
    cat "${STATUS_FILE}"
  else
    echo "STATUS=idle"
    echo "STAGE=none"
    echo "MESSAGE=no deploy has run yet"
  fi
  echo "---"
  if [[ -f "${SLOT_FILE}" ]]; then
    echo "SLOT_STATE:"
    cat "${SLOT_FILE}"
  else
    echo "SLOT_STATE=absent (default ACTIVE=blue)"
  fi
  echo "---"
  docker_run ps --filter "name=mlm_front_dev_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
  exit 0
fi

# ── --rollback ─────────────────────────────────────────────────

do_rollback() {
  load_slot_state
  local standby="${INACTIVE_SLOT}"
  if ! container_running "${standby}"; then
    echo "[remote-deploy-dev] rollback failed: standby $(container_name "${standby}") is not running" >&2
    exit 1
  fi
  if ! container_running "${ACTIVE_SLOT}"; then
    echo "[remote-deploy-dev] warning: active $(container_name "${ACTIVE_SLOT}") not running; promoting standby anyway"
  fi

  echo ">>> rollback: ${ACTIVE_SLOT}(active) ↔ ${standby}(standby)"
  write_slot_state "${standby}"
  apply_port_env_from_state
  # After write_slot_state, ACTIVE is the former standby
  compose_with_ports up -d --no-build --force-recreate \
    "$(service_name blue)" "$(service_name green)" \
    || fail "rollback" "compose recreate after rollback failed"

  if ! health_check "http://127.0.0.1:${PUBLIC_PORT}/" 15; then
    fail "rollback" "health check on :${PUBLIC_PORT} failed after swap"
  fi

  write_status "done" "done" "Rollback complete. active=${ACTIVE_SLOT} on :${PUBLIC_PORT}"
  echo ">>> rollback done → active=$(container_name "${ACTIVE_SLOT}") :${PUBLIC_PORT}"
  echo ">>> standby=$(container_name "${INACTIVE_SLOT}") ${STANDBY_BIND}"
}

if [[ "${1:-}" == "--rollback" ]]; then
  STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  do_rollback
  exit 0
fi

# ── deploy (default) ───────────────────────────────────────────

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

echo "======== remote-deploy-dev (nibdev blue/green) start ${STARTED_AT} sha=${GIT_SHA:-unknown} ========"
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

write_status "network" "running" "Ensuring docker network nginx exists"
if ! docker_run network inspect nginx >/dev/null 2>&1; then
  docker_run network create nginx || fail "network" "docker network create nginx failed"
fi

write_status "env" "running" "Patching .env (auth URLs + APP_PORT)"
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
set_port .env "${PUBLIC_PORT}"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  fail "env" "missing ${COMPOSE_FILE}"
fi

export_build_env

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

# Legacy single-container cleanup (name only)
docker_run rm -f mlm_front mlm_front_prod mlm_front_dev 2>/dev/null || true

load_slot_state
active_up=0
if container_running "${ACTIVE_SLOT}"; then
  active_up=1
fi

echo ">>> slots: ACTIVE=${ACTIVE_SLOT} INACTIVE=${INACTIVE_SLOT} active_running=${active_up}"

# ── Cold start: no active container → build ACTIVE on :3000 ────

if [[ "${active_up}" -eq 0 ]]; then
  write_status "build" "running" "Cold start: building ${ACTIVE_SLOT} on :${PUBLIC_PORT}"
  write_slot_state "${ACTIVE_SLOT}"
  apply_port_env_from_state

  compose_with_ports build "$(service_name "${ACTIVE_SLOT}")" \
    || fail "build" "compose build ${ACTIVE_SLOT} failed"
  compose_with_ports up -d --no-deps "$(service_name "${ACTIVE_SLOT}")" \
    || fail "build" "compose up ${ACTIVE_SLOT} failed"

  if ! health_check "http://127.0.0.1:${PUBLIC_PORT}/" 30; then
    fail "health" "cold start health check on :${PUBLIC_PORT} failed"
  fi

  write_status "done" "done" "Cold start done. active=${ACTIVE_SLOT} on :${PUBLIC_PORT} (no standby yet)"
  echo "======== remote-deploy-dev done (cold start) ========"
  echo ">>> active=$(container_name "${ACTIVE_SLOT}") :${PUBLIC_PORT}"
  echo ">>> standby=none (next deploy creates the other slot on ${STANDBY_BIND})"
  exit 0
fi

# ── Normal: build INACTIVE on 127.0.0.1:2999, then swap ────────

write_status "build" "running" "Building inactive=${INACTIVE_SLOT} on ${STANDBY_BIND}"

# Ensure active keeps public port; inactive binds standby for the new build
if [[ "${ACTIVE_SLOT}" == "blue" ]]; then
  export BLUE_PORT_SPEC
  BLUE_PORT_SPEC="$(port_spec_public)"
  export GREEN_PORT_SPEC
  GREEN_PORT_SPEC="$(port_spec_standby)"
else
  export BLUE_PORT_SPEC
  BLUE_PORT_SPEC="$(port_spec_standby)"
  export GREEN_PORT_SPEC
  GREEN_PORT_SPEC="$(port_spec_public)"
fi

# Recreate active with correct public bind (in case of drift) without rebuild
compose_with_ports up -d --no-build --no-deps "$(service_name "${ACTIVE_SLOT}")" 2>/dev/null || true

echo "--- Building $(service_name "${INACTIVE_SLOT}")"
compose_with_ports build "$(service_name "${INACTIVE_SLOT}")" \
  || fail "build" "compose build ${INACTIVE_SLOT} failed"

echo "--- Starting inactive on ${STANDBY_BIND}"
compose_with_ports up -d --no-deps --force-recreate "$(service_name "${INACTIVE_SLOT}")" \
  || fail "build" "compose up ${INACTIVE_SLOT} failed"

if ! health_check "http://${STANDBY_BIND}/" 30; then
  echo "--- health failed; removing failed inactive, keeping active on :${PUBLIC_PORT}"
  compose_with_ports stop "$(service_name "${INACTIVE_SLOT}")" 2>/dev/null || true
  docker_run rm -f "$(container_name "${INACTIVE_SLOT}")" 2>/dev/null || true
  fail "health" "inactive health check on ${STANDBY_BIND} failed — active untouched"
fi

write_status "swap" "running" "Promoting ${INACTIVE_SLOT} → :${PUBLIC_PORT}"

# Swap: former inactive becomes active
write_slot_state "${INACTIVE_SLOT}"
apply_port_env_from_state

compose_with_ports up -d --no-build --force-recreate \
  "$(service_name blue)" "$(service_name green)" \
  || fail "swap" "compose recreate during swap failed"

if ! health_check "http://127.0.0.1:${PUBLIC_PORT}/" 20; then
  fail "swap" "health check on :${PUBLIC_PORT} failed after swap"
fi

write_status "prune" "running" "Pruning dangling images"
docker_run image prune -f >/dev/null 2>&1 || true

APP_URL_VALUE="$(grep -E '^NEXT_PUBLIC_APP_URL=' .env 2>/dev/null | head -1 | cut -d= -f2- || echo 'https://club.nibdev.com')"

write_status "done" "done" "Deploy finished. active=${ACTIVE_SLOT} :${PUBLIC_PORT}, standby=${INACTIVE_SLOT} ${STANDBY_BIND}"
echo "======== remote-deploy-dev done ========"
echo ">>> active=$(container_name "${ACTIVE_SLOT}") :${PUBLIC_PORT}"
echo ">>> standby=$(container_name "${INACTIVE_SLOT}") ${STANDBY_BIND} (localhost only)"
echo ">>> SSO callback base: ${APP_URL_VALUE}"
echo ">>> rollback: yarn sync:dev --rollback"
