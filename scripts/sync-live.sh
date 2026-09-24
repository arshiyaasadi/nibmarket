#!/usr/bin/env bash
#
# sync-live.sh — deploy WITHOUT Azure/git push
#
# From your Mac (WireGuard ON so the host resolves):
#   1) rsync project files → /opt/MLM_Front on the live host
#   2) ensure Docker (Ubuntu apt) + nginx network
#   3) seed .env.production / .env.v2 if missing (never overwrite existing)
#   4) docker compose build+up for prod (:3000) and v2/UI (:3001)
#
# Usage:
#   yarn sync:live
#   ./scripts/sync-live.sh
#   ./scripts/sync-live.sh --rsync-only
#   LIVE_SSH_HOST=<ip> yarn sync:live
#
set -euo pipefail

SSH_HOST="${LIVE_SSH_HOST:-club-docker.nibmarket.com}"
SSH_USER="${LIVE_SSH_USER:-novin}"
SSH_ALIAS="${LIVE_SSH_ALIAS:-nibmarket-live}"
SSH_KEY="${LIVE_SSH_KEY:-${HOME}/.ssh/nibmarket_live_ed25519}"
PROJECT_DIR="${LIVE_PROJECT_DIR:-/opt/MLM_Front}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"

RSYNC_ONLY=0
case "${1:-}" in
  --rsync-only) RSYNC_ONLY=1 ;;
  --help|-h)
    sed -n '2,20p' "$0"
    exit 0
    ;;
  "") ;;
  *)
    echo "Unknown option: $1 (use --rsync-only | --help)"
    exit 1
    ;;
esac

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: required command not found: $1"
    exit 1
  }
}

need_cmd ssh
need_cmd rsync

read_pass() {
  if [[ -s "${PASS_FILE}" ]]; then
    SSH_PASS="$(tr -d '\r\n' < "${PASS_FILE}")"
  else
    SSH_PASS=""
  fi
}

# Prefer SSH config Host alias when LIVE_SSH_HOST is unset
if [[ -n "${LIVE_SSH_HOST:-}" ]]; then
  TARGET="${SSH_USER}@${LIVE_SSH_HOST}"
elif grep -qE "^Host[[:space:]]+${SSH_ALIAS}([[:space:]]|$)" "${HOME}/.ssh/config" 2>/dev/null; then
  TARGET="${SSH_ALIAS}"
else
  TARGET="${SSH_USER}@${SSH_HOST}"
fi

read_pass

# Build ssh / rsync transport
USE_PASSWORD=0
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ConnectTimeout=15)
if [[ -f "${SSH_KEY}" ]]; then
  SSH_OPTS+=(-i "${SSH_KEY}" -o IdentitiesOnly=yes)
fi

if ssh "${SSH_OPTS[@]}" -o BatchMode=yes "${TARGET}" 'true' 2>/dev/null; then
  echo ">>> SSH key auth OK → ${TARGET}"
  RSYNC_RSH="ssh ${SSH_OPTS[*]}"
  remote() { ssh "${SSH_OPTS[@]}" "${TARGET}" "$@"; }
elif [[ -n "${SSH_PASS}" ]]; then
  need_cmd sshpass
  echo ">>> Falling back to password auth → ${TARGET}"
  USE_PASSWORD=1
  export SSHPASS="${SSH_PASS}"
  RSYNC_RSH="sshpass -e ssh ${SSH_OPTS[*]} -o PreferredAuthentications=password -o PubkeyAuthentication=no"
  remote() {
    sshpass -e ssh "${SSH_OPTS[@]}" -o PreferredAuthentications=password -o PubkeyAuthentication=no "${TARGET}" "$@"
  }
else
  echo "Error: cannot reach ${TARGET}."
  echo "  1) Turn WireGuard ON"
  echo "  2) Or: LIVE_SSH_HOST=<ip> yarn sync:live"
  echo "  3) Or create ${PASS_FILE} / fix SSH key"
  exit 1
fi

echo ">>> Remote dir: ${PROJECT_DIR}"
remote 'echo "--- connected as $(whoami)@$(hostname)"'

GIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ">>> Version stamp: ${GIT_SHA} @ ${BUILD_TIME}"

echo ">>> Ensuring remote directory"
if [[ -n "${SSH_PASS}" ]]; then
  remote "echo '${SSH_PASS}' | sudo -S -p '' mkdir -p '${PROJECT_DIR}' && echo '${SSH_PASS}' | sudo -S -p '' chown -R \$(whoami):\$(id -gn) '${PROJECT_DIR}'"
else
  remote "sudo mkdir -p '${PROJECT_DIR}' && sudo chown -R \$(whoami):\$(id -gn) '${PROJECT_DIR}'"
fi

echo ">>> rsync project → ${TARGET}:${PROJECT_DIR}/"
# shellcheck disable=SC2086
rsync -az --delete \
  -e "${RSYNC_RSH}" \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude 'coverage/' \
  --exclude '.husky/' \
  --exclude '.cursor/' \
  --exclude '.claude/' \
  --exclude '.cd-state/' \
  --exclude '.cd-git-credentials' \
  --exclude 'terminals/' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude 'tsconfig.tsbuildinfo' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.production' \
  --exclude '.env.v2' \
  --exclude 'live_ssh_pass.txt' \
  --exclude 'sudo_pass.txt' \
  --exclude 'git_credentials.txt' \
  --exclude 'doorkari-agent.txt' \
  --exclude 'form doorkari*.xlsx' \
  --exclude 'form doorkari*.xls' \
  "${REPO_ROOT}/" \
  "${TARGET}:${PROJECT_DIR}/"

echo ">>> Sync complete"

if [[ "${RSYNC_ONLY}" -eq 1 ]]; then
  echo ">>> --rsync-only: skipping Docker"
  exit 0
fi

echo ">>> Remote Docker + dual stack (prod :3000, v2/UI :3001)"
remote \
  SUDO_PASS="${SSH_PASS}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  GIT_SHA="${GIT_SHA}" \
  BUILD_TIME="${BUILD_TIME}" \
  'bash -s' <<'REMOTE_EOF'
set -euo pipefail

sudo_run() {
  if [[ -n "${SUDO_PASS:-}" ]]; then
    echo "${SUDO_PASS}" | sudo -S -p '' "$@"
  else
    sudo "$@"
  fi
}

cd "${PROJECT_DIR}"
chmod +x scripts/*.sh 2>/dev/null || true

echo "=== Docker (apt) ==="
if ! command -v docker >/dev/null 2>&1; then
  sudo_run apt-get update -y
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 \
    || sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker missing after apt"
  exit 1
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
    echo "Error: no compose binary"
    exit 1
  fi
}

echo "=== nginx network ==="
if ! sudo_run docker network inspect nginx >/dev/null 2>&1; then
  sudo_run docker network create nginx
fi

seed_secret() {
  local file="$1"
  if grep -q 'AUTH_SECRET=<generate' "${file}" 2>/dev/null || grep -qE '^AUTH_SECRET=$' "${file}" 2>/dev/null; then
    SECRET="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p | tr -d '\n' | head -c 48)"
    sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" "${file}" && rm -f "${file}.bak"
  fi
}

[[ -f .env.production ]] || { cp .env.production.example .env.production; seed_secret .env.production; echo "--- seeded .env.production"; }
[[ -f .env.v2 ]] || { cp .env.v2.example .env.v2; echo "--- seeded .env.v2"; }
[[ -f .env ]] || cp .env.production .env

export GIT_SHA BUILD_TIME NEXT_PUBLIC_GIT_SHA="${GIT_SHA}"

# Avoid Docker Hub / CloudFront 403: no dockerfile frontend syntax, use GCR mirror for node
export NODE_BASE_IMAGE="${NODE_BASE_IMAGE:-mirror.gcr.io/library/node:22-bookworm-slim}"
echo "=== Pulling base image: ${NODE_BASE_IMAGE} ==="
pull_base() {
  if docker info >/dev/null 2>&1; then
    docker pull "$1"
  else
    sudo_run docker pull "$1"
  fi
}
if ! pull_base "${NODE_BASE_IMAGE}"; then
  for alt in \
    "docker.arvancloud.ir/library/node:22-bookworm-slim" \
    "registry.docker.ir/library/node:22-bookworm-slim" \
    "node:22-bookworm-slim"
  do
    echo "--- retry base image: ${alt}"
    if pull_base "${alt}"; then
      export NODE_BASE_IMAGE="${alt}"
      break
    fi
  done
fi
echo "--- Using NODE_BASE_IMAGE=${NODE_BASE_IMAGE}"

echo "=== prod (:3000) ==="
set -a
# shellcheck disable=SC1091
source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env.production | sed 's/\r$//' || true)
set +a
compose_run -p mlm-prod -f docker-compose.prod.yml --env-file .env.production up -d --build --remove-orphans

echo "=== v2/UI (:3001) ==="
set -a
# shellcheck disable=SC1091
source <(grep -E '^(APP_ENV|NEXT_PUBLIC_APP_ENV|APP_PORT)=' .env.v2 | sed 's/\r$//' || true)
set +a
export FORCE_UI_DEV_MODE=1 NEXT_PUBLIC_FORCE_UI_DEV_MODE=1
compose_run -p mlm-v2 -f docker-compose.v2.yml --env-file .env.v2 up -d --build --remove-orphans

compose_run -p mlm-prod -f docker-compose.prod.yml ps || true
compose_run -p mlm-v2 -f docker-compose.v2.yml ps || true
echo ">>> Deploy done. version=${GIT_SHA}"
REMOTE_EOF

echo ""
echo ">>> Done (password_fallback=${USE_PASSWORD})."
echo "    Re-deploy: yarn sync:live"
echo "    prod :3000 | v2/UI :3001"
