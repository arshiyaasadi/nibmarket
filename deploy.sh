#!/usr/bin/env bash
#
# deploy.sh — run from your local machine
# Performs the deployment on the remote server:
#   1) SSH into the server (using your existing key)
#   2) cd into the project directory
#   3) git fetch + reset --hard (no merge — avoids conflicts on server)
#   4) bring containers up with docker compose (production)
#
# Required local files (next to this script):
#   sudo_pass.txt      — sudo password for the remote server
#   git_credentials.txt — line 1: git username, line 2: git password/token

set -euo pipefail

# ---------- config ----------
SSH_HOST="${DEPLOY_SSH_HOST:-pod1.nibdev.com}"
PROJECT_DIR="${DEPLOY_PROJECT_DIR:-/opt/MLM_Front}"
COMPOSE_FILE="${DEPLOY_COMPOSE_FILE:-docker-compose.prod.yml}"

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

# Resolve compose file after sync (prod alias may not exist on older checkouts)
COMPOSE_PATH="${COMPOSE_FILE}"
if [[ ! -f "${COMPOSE_PATH}" ]]; then
  if [[ -f "docker-compose.yml" ]]; then
    echo "Warning: ${COMPOSE_FILE} not found — falling back to docker-compose.yml"
    COMPOSE_PATH="docker-compose.yml"
  else
    echo "Error: no compose file found in ${PROJECT_DIR} after git sync"
    exit 1
  fi
fi

if [[ ! -f ".env" ]]; then
  if [[ ! -f ".env.example" ]]; then
    echo "Error: neither .env nor .env.example found after git sync"
    exit 1
  fi
  echo "--- .env missing — copying from .env.example"
  echo "Warning: update production secrets in ${PROJECT_DIR}/.env if this is first deploy"
  if cp .env.example .env 2>/dev/null; then
    :
  else
    echo "${SUDO_PASS}" | sudo -S cp .env.example .env
  fi
fi

echo "--- Building and starting containers (${COMPOSE_PATH})"
echo "${SUDO_PASS}" | sudo -S docker compose -f "${COMPOSE_PATH}" up -d --build --remove-orphans

echo "--- Container status"
echo "${SUDO_PASS}" | sudo -S docker compose -f "${COMPOSE_PATH}" ps

echo ">>> Deployment completed successfully."
REMOTE_EOF

echo ">>> Done."
