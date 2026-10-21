#!/usr/bin/env bash
#
# server-cd.sh — runs ON the live host (behind WireGuard).
# Polls git remote; on new commits rebuilds the live stack:
#   - mlm-live  (docker-compose.live.yml + .env.live)  → port 3000
#
# Installed by bootstrap-live-server.sh as a systemd timer.
# Manual: sudo /opt/MLM_Front/scripts/server-cd.sh
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/MLM_Front}"
GIT_BRANCH="${GIT_BRANCH:-main}"
STATE_DIR="${PROJECT_DIR}/.cd-state"
LAST_SHA_FILE="${STATE_DIR}/last-deployed-sha"
LOCK_FILE="${STATE_DIR}/deploy.lock"
LOG_PREFIX="[mlm-cd]"
COMPOSE_FILE="docker-compose.live.yml"
COMPOSE_PROJECT="mlm-live"
ENV_FILE=".env.live"
LIVE_PORT=3000

cd "${PROJECT_DIR}"
mkdir -p "${STATE_DIR}"

GIT=(git -C "${PROJECT_DIR}" -c "safe.directory=${PROJECT_DIR}")

urlencode() {
  local s="$1" out="" c
  for (( i=0; i<${#s}; i++ )); do
    c="${s:$i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c" ;;
      *) printf -v hex '%%%02X' "'$c"; out+="$hex" ;;
    esac
  done
  printf '%s' "$out"
}

docker_cmd() {
  if docker info >/dev/null 2>&1; then
    docker "$@"
  else
    sudo docker "$@"
  fi
}

compose() {
  local project="$1"
  shift
  docker_cmd compose -p "${project}" "$@"
}

ensure_env_file() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    if [[ -f .env.live.example ]]; then
      cp .env.live.example "${ENV_FILE}"
      SECRET="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p | tr -d '\n' | head -c 48)"
      sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
      echo "${LOG_PREFIX} seeded ${ENV_FILE}"
    elif [[ -f .env.production ]]; then
      cp .env.production "${ENV_FILE}"
      echo "${LOG_PREFIX} migrated .env.production → ${ENV_FILE}"
    elif [[ -f .env ]]; then
      cp .env "${ENV_FILE}"
      echo "${LOG_PREFIX} copied .env → ${ENV_FILE}"
    else
      echo "${LOG_PREFIX} ERROR: missing ${ENV_FILE}"
      exit 1
    fi
  fi
}

auth_fetch_url() {
  local cred_file="${PROJECT_DIR}/.cd-git-credentials"
  local origin user pass host_path
  origin="$("${GIT[@]}" config --get remote.origin.url 2>/dev/null || true)"
  if [[ -z "${origin}" ]]; then
    echo "${LOG_PREFIX} ERROR: no remote.origin.url"
    exit 1
  fi

  if [[ "${origin}" == *"@"* && "${origin}" == https://* ]]; then
    printf '%s' "${origin}"
    return
  fi

  if [[ -f "${cred_file}" ]]; then
    user="$(sed -n '1p' "${cred_file}" | tr -d '\r')"
    pass="$(sed -n '2p' "${cred_file}" | tr -d '\r')"
    host_path="${origin#*://}"
    host_path="${host_path#*@}"
    printf 'https://%s:%s@%s' "$(urlencode "${user}")" "$(urlencode "${pass}")" "${host_path}"
    return
  fi

  printf '%s' "${origin}"
}

acquire_lock() {
  if [[ -f "${LOCK_FILE}" ]]; then
    local old_pid
    old_pid="$(cat "${LOCK_FILE}" 2>/dev/null || true)"
    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      echo "${LOG_PREFIX} another deploy is running (pid ${old_pid}) — skip"
      exit 0
    fi
  fi
  echo $$ > "${LOCK_FILE}"
  trap 'rm -f "${LOCK_FILE}"' EXIT
}

deploy_stack() {
  local sha="$1"
  local built
  built="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  export GIT_SHA="${sha}"
  export BUILD_TIME="${built}"

  ensure_env_file

  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' "${ENV_FILE}" | sed 's/\r$//')
  set +a
  echo "${LOG_PREFIX} building live (GIT_SHA=${sha})"
  if grep -qE '^APP_PORT=' "${ENV_FILE}" 2>/dev/null; then
    sed -i.bak "s|^APP_PORT=.*|APP_PORT=${LIVE_PORT}|" "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
  fi
  export APP_PORT="${LIVE_PORT}"
  compose "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --build --remove-orphans

  # One-shot cleanup of legacy containers
  docker_cmd rm -f mlm_front_v2 mlm_front_prod mlm_front 2>/dev/null || true

  echo "${sha}" > "${LAST_SHA_FILE}"
  echo "${LOG_PREFIX} deployed ${sha} at ${built}"
  compose "${COMPOSE_PROJECT}" -f "${COMPOSE_FILE}" ps || true
}

# ---------- main ----------
acquire_lock

if [[ ! -d "${PROJECT_DIR}/.git" ]]; then
  echo "${LOG_PREFIX} ERROR: ${PROJECT_DIR} is not a git checkout"
  exit 1
fi

FETCH_URL="$(auth_fetch_url)"
echo "${LOG_PREFIX} fetching ${GIT_BRANCH}..."
"${GIT[@]}" fetch "${FETCH_URL}" "${GIT_BRANCH}" --quiet

REMOTE_SHA="$("${GIT[@]}" rev-parse "FETCH_HEAD")"
LOCAL_SHA="$("${GIT[@]}" rev-parse HEAD 2>/dev/null || echo none)"
LAST_DEPLOYED="$(cat "${LAST_SHA_FILE}" 2>/dev/null || echo none)"

FORCE="${1:-}"
if [[ "${FORCE}" == "--force" ]]; then
  echo "${LOG_PREFIX} --force: redeploy regardless of SHA"
elif [[ "${REMOTE_SHA}" == "${LAST_DEPLOYED}" ]]; then
  echo "${LOG_PREFIX} up to date (${REMOTE_SHA:0:8}) — nothing to do"
  exit 0
fi

echo "${LOG_PREFIX} new revision: ${LOCAL_SHA:0:8} → ${REMOTE_SHA:0:8}"
"${GIT[@]}" reset --hard "${REMOTE_SHA}"

if ! docker_cmd network inspect nginx >/dev/null 2>&1; then
  docker_cmd network create nginx
fi

deploy_stack "${REMOTE_SHA:0:12}"
