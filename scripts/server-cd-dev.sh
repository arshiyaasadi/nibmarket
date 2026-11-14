#!/usr/bin/env bash
#
# server-cd-dev.sh — runs ON the nibdev host (pod1.nibdev.com).
# Polls Azure git for `develop`; on new commits runs remote-deploy-dev.sh (blue/green).
#
# Installed as systemd timer `mlm-cd-dev.timer`.
# Manual: PROJECT_DIR=/opt/MLM_Front bash /opt/MLM_Front/scripts/server-cd-dev.sh
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/MLM_Front}"
GIT_BRANCH="${GIT_BRANCH:-develop}"
STATE_DIR="${PROJECT_DIR}/.cd-state"
LAST_SHA_FILE="${STATE_DIR}/last-deployed-sha-dev"
LOCK_FILE="${STATE_DIR}/deploy-dev.lock"
LOG_PREFIX="[mlm-cd-dev]"

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
  export PROJECT_DIR

  echo "${LOG_PREFIX} running remote-deploy-dev.sh (GIT_SHA=${sha})"
  bash "${PROJECT_DIR}/scripts/remote-deploy-dev.sh"
  echo "${sha}" > "${LAST_SHA_FILE}"
  echo "${LOG_PREFIX} deployed ${sha} at ${built}"
}

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
"${GIT[@]}" checkout -B "${GIT_BRANCH}" "${REMOTE_SHA}"
"${GIT[@]}" reset --hard "${REMOTE_SHA}"

if ! docker info >/dev/null 2>&1; then
  if ! sudo docker network inspect nginx >/dev/null 2>&1; then
    sudo docker network create nginx
  fi
elif ! docker network inspect nginx >/dev/null 2>&1; then
  docker network create nginx
fi

deploy_stack "${REMOTE_SHA:0:12}"
