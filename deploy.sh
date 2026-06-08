#!/usr/bin/env bash
#
# deploy.sh — run from your local machine
# Performs the deployment on the remote server:
#   1) SSH into the server (using your existing key)
#   2) cd into the project directory
#   3) git pull
#   4) bring containers up with docker compose
#
# The sudo password is read from sudo_pass.txt (you fill it in yourself).

set -euo pipefail

# ---------- config ----------
SSH_HOST="pod1.nibdev.com"
PROJECT_DIR="/opt/MLM_Front"

GIT_USER="a.asadi"
GIT_PASS='As@!di876$%'

# sudo password file (next to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUDO_PASS_FILE="${SCRIPT_DIR}/sudo_pass.txt"
# ----------------------------

if [[ ! -s "${SUDO_PASS_FILE}" ]]; then
  echo "Error: sudo password file is empty or missing: ${SUDO_PASS_FILE}"
  echo "Please put your sudo password inside it."
  exit 1
fi

SUDO_PASS="$(cat "${SUDO_PASS_FILE}")"

echo ">>> Connecting to ${SSH_HOST} and running deployment..."

ssh -t "${SSH_HOST}" \
  GIT_USER="${GIT_USER}" \
  GIT_PASS="${GIT_PASS}" \
  SUDO_PASS="${SUDO_PASS}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  'bash -s' <<'REMOTE_EOF'
set -euo pipefail

echo "--- Entering project directory: ${PROJECT_DIR}"
cd "${PROJECT_DIR}"

# URL-encode credentials (password contains special characters)
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

# Read current remote URL, then inject credentials temporarily
ORIG_URL="$(echo "${SUDO_PASS}" | sudo -S git config --get remote.origin.url 2>/dev/null)"

echo "--- Running git pull"
# Extract host/path from the original URL (https assumed)
HOST_PATH="${ORIG_URL#*://}"
HOST_PATH="${HOST_PATH#*@}"   # strip any existing credentials
AUTH_URL="https://${GIT_USER_ENC}:${GIT_PASS_ENC}@${HOST_PATH}"

echo "${SUDO_PASS}" | sudo -S git pull "${AUTH_URL}"

echo "--- Bringing containers up with docker compose"
echo "${SUDO_PASS}" | sudo -S docker compose up -d --build

echo ">>> Deployment completed successfully."
REMOTE_EOF

echo ">>> Done."
