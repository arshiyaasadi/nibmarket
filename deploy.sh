#!/usr/bin/env bash
#
# deploy.sh — run from your local machine
# Performs the deployment on the remote server:
#   1) SSH into the server (using your existing key)
#   2) cd into the project directory
#   3) git fetch + reset --hard (no merge — avoids conflicts on server)
#   4) bring containers up with docker compose (production)
#
# Zone (APP_ENV):
#   - Default deploy host is nibdev → APP_ENV=development (nibdev URLs).
#   - For nibmarket live: set APP_ENV=production in the server .env
#     (or DEPLOY_APP_ENV=production when seeding a missing .env).
#   - Changing APP_ENV requires a rebuild (this script always --build).
#
# Required local files (next to this script):
#   sudo_pass.txt      — sudo password for the remote server
#   git_credentials.txt — line 1: git username, line 2: git password/token

set -euo pipefail

# ---------- config ----------
SSH_HOST="${DEPLOY_SSH_HOST:-pod1.nibdev.com}"
PROJECT_DIR="${DEPLOY_PROJECT_DIR:-/opt/MLM_Front}"
COMPOSE_FILE="${DEPLOY_COMPOSE_FILE:-docker-compose.dev.yml}"
# Used only when seeding a missing .env on the server (development | production)
DEPLOY_APP_ENV="${DEPLOY_APP_ENV:-development}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUDO_PASS_FILE="${SCRIPT_DIR}/sudo_pass.txt"
GIT_CREDENTIALS_FILE="${SCRIPT_DIR}/git_credentials.txt"
# ----------------------------

if [[ ! -s "${SUDO_PASS_FILE}" ]]; then
  echo "Error: sudo password file is empty or missing: ${SUDO_PASS_FILE}"
  exit 1
fi

if [[ ! -s "${GIT_CREDENTIALS_FILE}" ]]; then
  echo "Error: git credentials file is empty or missing: ${GIT_CREDENTIALS_FILE}"
  echo "Format: line 1 = username, line 2 = password or personal access token"
  exit 1
fi

SUDO_PASS="$(cat "${SUDO_PASS_FILE}")"
GIT_USER="$(sed -n '1p' "${GIT_CREDENTIALS_FILE}")"
GIT_PASS="$(sed -n '2p' "${GIT_CREDENTIALS_FILE}")"

if [[ -z "${GIT_USER}" || -z "${GIT_PASS}" ]]; then
  echo "Error: git_credentials.txt must contain username on line 1 and password on line 2."
  exit 1
fi

echo ">>> Connecting to ${SSH_HOST} and running deployment..."

ssh "${SSH_HOST}" \
  GIT_USER="${GIT_USER}" \
  GIT_PASS="${GIT_PASS}" \
  SUDO_PASS="${SUDO_PASS}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  COMPOSE_FILE="${COMPOSE_FILE}" \
  DEPLOY_APP_ENV="${DEPLOY_APP_ENV}" \
  'bash -s' <<'REMOTE_EOF'
set -euo pipefail

echo "--- Entering project directory: ${PROJECT_DIR}"
if [[ ! -d "${PROJECT_DIR}" ]]; then
  echo "Error: project directory does not exist: ${PROJECT_DIR}"
  exit 1
fi
cd "${PROJECT_DIR}"

# sudo git sees a different owner than the repo — allow this path explicitly
GIT=(git -C "${PROJECT_DIR}" -c "safe.directory=${PROJECT_DIR}")

git_sudo() {
  echo "${SUDO_PASS}" | sudo -S "${GIT[@]}" "$@"
}

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

GIT_USER_ENC="$(urlencode "${GIT_USER}")"
GIT_PASS_ENC="$(urlencode "${GIT_PASS}")"

ORIG_URL="$(git_sudo config --get remote.origin.url 2>/dev/null || true)"
if [[ -z "${ORIG_URL}" ]]; then
  echo "Error: git remote.origin.url is not configured in ${PROJECT_DIR}"
  exit 1
fi

HOST_PATH="${ORIG_URL#*://}"
HOST_PATH="${HOST_PATH#*@}"
AUTH_URL="https://${GIT_USER_ENC}:${GIT_PASS_ENC}@${HOST_PATH}"
BRANCH="${DEPLOY_BRANCH:-$(git_sudo rev-parse --abbrev-ref HEAD)}"

echo "--- Syncing with remote (${BRANCH}, hard reset — server must match remote exactly)"
git_sudo merge --abort 2>/dev/null || true
git_sudo fetch "${AUTH_URL}" "${BRANCH}"
git_sudo reset --hard FETCH_HEAD

SYNCED_COMMIT="$(git_sudo rev-parse --short HEAD)"
echo "--- Synced to commit: ${SYNCED_COMMIT}"

COMPOSE_PATH="${COMPOSE_FILE}"
if [[ ! -f "${COMPOSE_PATH}" ]]; then
  echo "Error: compose file not found: ${COMPOSE_PATH}"
  exit 1
fi

if [[ ! -f ".env" ]]; then
  ENV_TEMPLATE=".env.example"
  if [[ "${DEPLOY_APP_ENV}" == "production" ]]; then
    ENV_TEMPLATE=".env.live.example"
  fi
  if [[ ! -f "${ENV_TEMPLATE}" ]]; then
    ENV_TEMPLATE=".env.example"
  fi
  if [[ ! -f "${ENV_TEMPLATE}" ]]; then
    echo "Error: neither .env nor ${ENV_TEMPLATE} found after git sync"
    exit 1
  fi
  echo "--- .env missing — copying from ${ENV_TEMPLATE} (DEPLOY_APP_ENV=${DEPLOY_APP_ENV})"
  echo "Warning: update AUTH_SECRET (and APP_ENV) in ${PROJECT_DIR}/.env if this is first deploy"
  if cp "${ENV_TEMPLATE}" .env 2>/dev/null; then
    :
  else
    echo "${SUDO_PASS}" | sudo -S cp "${ENV_TEMPLATE}" .env
  fi
fi

APP_ENV_VALUE="$(grep -E '^APP_ENV=' .env 2>/dev/null | head -n1 | cut -d= -f2- || true)"
APP_ENV_VALUE="${APP_ENV_VALUE:-development}"
echo "--- APP_ENV=${APP_ENV_VALUE} (client URLs are baked at image build — rebuild required to change zone)"

echo "--- Building and starting containers (${COMPOSE_PATH})"
echo "${SUDO_PASS}" | sudo -S docker compose -f "${COMPOSE_PATH}" up -d --build --remove-orphans

echo "--- Container status"
echo "${SUDO_PASS}" | sudo -S docker compose -f "${COMPOSE_PATH}" ps

echo ">>> Deployment completed successfully."
REMOTE_EOF

echo ">>> Done."
