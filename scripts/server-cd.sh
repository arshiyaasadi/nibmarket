#!/usr/bin/env bash
#
# server-cd.sh — runs ON the live host (behind WireGuard).
# Polls git remote; on new commits rebuilds BOTH stacks:
#   - mlm-prod  (docker-compose.prod.yml + .env.production)  → port 3000
#   - mlm-v2    (docker-compose.v2.yml   + .env.v2)          → port 3001
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

ensure_env_files() {
  if [[ ! -f .env.production ]]; then
    if [[ -f .env.production.example ]]; then
      cp .env.production.example .env.production
      SECRET="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p | tr -d '\n' | head -c 48)"
      sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.production && rm -f .env.production.bak
      echo "${LOG_PREFIX} seeded .env.production"
    elif [[ -f .env ]]; then
      cp .env .env.production
      echo "${LOG_PREFIX} copied .env → .env.production"
    else
      echo "${LOG_PREFIX} ERROR: missing .env.production"
      exit 1
    fi
  fi

  if [[ ! -f .env.v2 ]]; then
    if [[ -f .env.v2.example ]]; then
      cp .env.v2.example .env.v2
      echo "${LOG_PREFIX} seeded .env.v2"
    else
      echo "${LOG_PREFIX} ERROR: missing .env.v2"
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

  # Already has credentials embedded
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

  # Fall back to bare origin (SSH remote or credential helper)
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

deploy_stacks() {
  local sha="$1"
  local built
  built="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  export GIT_SHA="${sha}"
  export BUILD_TIME="${built}"

  ensure_env_files

  # Export APP_ENV from each env file for compose build args
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env.production | sed 's/\r$//')
  set +a
  echo "${LOG_PREFIX} building production (GIT_SHA=${sha})"
  compose mlm-prod -f docker-compose.prod.yml --env-file .env.production up -d --build --remove-orphans

  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env.v2 | sed 's/\r$//')
  set +a
  export FORCE_UI_DEV_MODE=1
  export NEXT_PUBLIC_FORCE_UI_DEV_MODE=1
  echo "${LOG_PREFIX} building v2/UI (GIT_SHA=${sha})"
  compose mlm-v2 -f docker-compose.v2.yml --env-file .env.v2 up -d --build --remove-orphans

  echo "${sha}" > "${LAST_SHA_FILE}"
  echo "${LOG_PREFIX} deployed ${sha} at ${built}"
  compose mlm-prod -f docker-compose.prod.yml ps || true
  compose mlm-v2 -f docker-compose.v2.yml ps || true
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

# Ensure nginx network exists
if ! docker_cmd network inspect nginx >/dev/null 2>&1; then
  docker_cmd network create nginx
fi

deploy_stacks "${REMOTE_SHA:0:12}"
