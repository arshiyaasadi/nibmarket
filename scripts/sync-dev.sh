#!/usr/bin/env bash
#
# sync-dev.sh — deploy to TEST / nibdev host (pod1.nibdev.com)
#
# From your Mac:
#   1) rsync project → /opt/MLM_Front
#   2) start remote-deploy-dev.sh DETACHED (patches .env for nibdev auth URLs)
#
# Usage:
#   yarn sync:dev
#   yarn sync:dev --status
#   yarn sync:dev --follow
#   yarn sync:dev --rsync-only
#   yarn sync:dev --force
#   DEV_SSH_HOST=<host> yarn sync:dev
#
set -euo pipefail

SSH_HOST="${DEV_SSH_HOST:-pod1.nibdev.com}"
SSH_USER="${DEV_SSH_USER:-}"
SSH_ALIAS="${DEV_SSH_ALIAS:-nibdev}"
SSH_KEY="${DEV_SSH_KEY:-}"
PROJECT_DIR="${DEV_PROJECT_DIR:-/opt/MLM_Front}"
APP_PORT_HOST="${DEV_APP_PORT:-3000}"
# unused in remote path now — kept for override docs
COMPOSE_HINT="docker-compose.yml → mlm_front"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/sudo_pass.txt"
LIVE_PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"

RSYNC_ONLY=0
STATUS_ONLY=0
FOLLOW=0
FORCE=0
for arg in "$@"; do
  case "${arg}" in
    --rsync-only) RSYNC_ONLY=1 ;;
    --status) STATUS_ONLY=1 ;;
    --follow) FOLLOW=1 ;;
    --force) FORCE=1 ;;
    --help|-h)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg} (use --status | --follow | --rsync-only | --force | --help)"
      exit 1
      ;;
  esac
done

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
  elif [[ -s "${LIVE_PASS_FILE}" ]]; then
    SSH_PASS="$(tr -d '\r\n' < "${LIVE_PASS_FILE}")"
  else
    SSH_PASS=""
  fi
}

# Resolve SSH target: explicit host > ssh alias > user@host
if [[ -n "${DEV_SSH_HOST:-}" ]]; then
  if [[ -n "${SSH_USER}" ]]; then
    TARGET="${SSH_USER}@${DEV_SSH_HOST}"
  else
    TARGET="${DEV_SSH_HOST}"
  fi
elif grep -qE "^Host[[:space:]]+${SSH_ALIAS}([[:space:]]|$)" "${HOME}/.ssh/config" 2>/dev/null; then
  TARGET="${SSH_ALIAS}"
else
  TARGET="${SSH_HOST}"
fi

read_pass

USE_PASSWORD=0
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ConnectTimeout=15)
if [[ -n "${SSH_KEY}" && -f "${SSH_KEY}" ]]; then
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
  echo "  1) Ensure SSH works: ssh ${TARGET}"
  echo "  2) Or: DEV_SSH_HOST=<host> yarn sync:dev"
  echo "  3) Or create ${PASS_FILE}"
  exit 1
fi

print_remote_status() {
  echo ">>> Remote deploy status (${PROJECT_DIR}/.cd-state/deploy-status)"
  remote "bash '${PROJECT_DIR}/scripts/remote-deploy-dev.sh' --status" 2>/dev/null \
    || remote "cat '${PROJECT_DIR}/.cd-state/deploy-status' 2>/dev/null || echo 'STATUS=idle'"
}

remote_is_running() {
  local status_blob
  status_blob="$(remote "cat '${PROJECT_DIR}/.cd-state/deploy-status' 2>/dev/null || true")"
  echo "${status_blob}" | grep -qE '^STATUS=running$' || return 1
  local pid
  pid="$(echo "${status_blob}" | grep -E '^PID=' | head -1 | cut -d= -f2-)"
  [[ -n "${pid}" ]] || return 1
  remote "kill -0 '${pid}' 2>/dev/null" >/dev/null 2>&1
}

follow_log() {
  echo ">>> Following ${PROJECT_DIR}/.cd-state/deploy.log (Ctrl+C stops follow only — deploy keeps running)"
  remote "tail -n 40 -f '${PROJECT_DIR}/.cd-state/deploy.log'" || true
}

if [[ "${STATUS_ONLY}" -eq 1 ]]; then
  print_remote_status
  exit 0
fi

if [[ "${FOLLOW}" -eq 1 ]] && [[ "${FORCE}" -eq 0 ]] && [[ "${RSYNC_ONLY}" -eq 0 ]]; then
  print_remote_status
  follow_log
  exit 0
fi

if [[ "${FORCE}" -eq 0 ]] && [[ "${RSYNC_ONLY}" -eq 0 ]]; then
  if remote_is_running; then
    echo ">>> A remote deploy is already running."
    print_remote_status
    echo ""
    echo "    yarn sync:dev --status"
    echo "    yarn sync:dev --follow"
    echo "    yarn sync:dev --force"
    exit 0
  fi
fi

echo ">>> Target: TEST/nibdev → ${TARGET}"
echo ">>> Remote dir: ${PROJECT_DIR}"
remote 'echo "--- connected as $(whoami)@$(hostname)"'

GIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ">>> Version stamp: ${GIT_SHA} @ ${BUILD_TIME}"

echo ">>> Ensuring remote directory"
if [[ -n "${SSH_PASS}" ]]; then
  remote "echo '${SSH_PASS}' | sudo -S -p '' mkdir -p '${PROJECT_DIR}' && echo '${SSH_PASS}' | sudo -S -p '' chown -R \$(whoami):\$(id -gn) '${PROJECT_DIR}'"
else
  remote "sudo mkdir -p '${PROJECT_DIR}' && sudo chown -R \$(whoami):\$(id -gn) '${PROJECT_DIR}'" 2>/dev/null \
    || remote "mkdir -p '${PROJECT_DIR}'"
fi

if [[ "${FORCE}" -eq 1 ]]; then
  echo ">>> --force: stopping previous remote deploy if any"
  remote PROJECT_DIR="${PROJECT_DIR}" 'bash -s' <<'KILL_EOF'
set +e
STATE="${PROJECT_DIR}/.cd-state"
if [[ -f "${STATE}/deploy.pid" ]]; then
  old="$(cat "${STATE}/deploy.pid")"
  kill "${old}" 2>/dev/null
  sleep 1
  kill -9 "${old}" 2>/dev/null
fi
rm -f "${STATE}/deploy.lock" "${STATE}/deploy.pid"
if [[ -f "${STATE}/deploy-status" ]]; then
  sed -i 's/^STATUS=.*/STATUS=idle/' "${STATE}/deploy-status" 2>/dev/null || true
fi
KILL_EOF
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
  echo ">>> --rsync-only: skipping Docker build"
  exit 0
fi

echo ">>> Starting DETACHED remote-deploy-dev (nibdev env + single stack)"
remote \
  SUDO_PASS="${SSH_PASS}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  GIT_SHA="${GIT_SHA}" \
  BUILD_TIME="${BUILD_TIME}" \
  APP_PORT_HOST="${APP_PORT_HOST}" \
  'bash -s' <<'REMOTE_EOF'
set -euo pipefail
cd "${PROJECT_DIR}"
chmod +x scripts/*.sh scripts/lib/*.sh 2>/dev/null || true
mkdir -p .cd-state

if [[ ! -f scripts/remote-deploy-dev.sh ]]; then
  echo "Error: scripts/remote-deploy-dev.sh missing after rsync"
  exit 1
fi

nohup env \
  SUDO_PASS="${SUDO_PASS:-}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  GIT_SHA="${GIT_SHA}" \
  BUILD_TIME="${BUILD_TIME}" \
  APP_PORT_HOST="${APP_PORT_HOST}" \
  bash "${PROJECT_DIR}/scripts/remote-deploy-dev.sh" \
  >/dev/null 2>&1 &

echo $! > .cd-state/deploy.pid
disown || true
for _ in 1 2 3 4 5; do
  sleep 1
  if [[ -f .cd-state/deploy-status ]]; then
    break
  fi
done
echo "--- detached pid=$(cat .cd-state/deploy.pid)"
cat .cd-state/deploy-status 2>/dev/null || echo "STATUS=running STAGE=starting"
REMOTE_EOF

echo ""
echo ">>> DEV deploy is running on ${TARGET} (you can close this terminal)."
echo "    Re-check:  yarn sync:dev --status"
echo "    Stream:    yarn sync:dev --follow"
echo "    Restart:   yarn sync:dev --force"
echo "    password_fallback=${USE_PASSWORD}"
