#!/usr/bin/env bash
#
# sync-live.sh — deploy WITHOUT Azure/git push (nibmarket live host)
#
# From your Mac (WireGuard ON):
#   1) rsync project → /opt/MLM_Front
#   2) start remote-deploy.sh DETACHED on the server (survives closed terminal)
#   3) on re-run: report current STAGE / STATUS instead of starting a duplicate
#
# Usage:
#   yarn sync:live
#   yarn sync:live --status          # only print remote stage
#   yarn sync:live --follow          # stream remote log until done/failed
#   yarn sync:live --rsync-only
#   yarn sync:live --force           # kill stuck remote deploy and restart
#   yarn sync:live --ui-mock         # live host with in-memory mocks (UI review)
#   LIVE_UI_MOCK=1 yarn sync:live    # same as --ui-mock
#   LIVE_SSH_HOST=<ip> yarn sync:live
#
# Ports on live host: live stack :3002 only
#
set -euo pipefail

SSH_HOST="${LIVE_SSH_HOST:-club-docker.nibmarket.com}"
SSH_USER="${LIVE_SSH_USER:-novin}"
SSH_ALIAS="${LIVE_SSH_ALIAS:-nibmarket-live}"
SSH_KEY="${LIVE_SSH_KEY:-${HOME}/.ssh/nibmarket_live_ed25519}"
PROJECT_DIR="${LIVE_PROJECT_DIR:-/opt/MLM_Front}"
LIVE_PORT="${LIVE_PORT:-${PROD_PORT:-3002}}"
NGINX_DOMAIN="${NGINX_DOMAIN:-club.nibmarket.ir}"
LIVE_UI_MOCK="${LIVE_UI_MOCK:-0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"

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
    --ui-mock) LIVE_UI_MOCK=1 ;;
    --help|-h)
      sed -n '2,24p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg} (use --status | --follow | --rsync-only | --force | --ui-mock | --help)"
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
  else
    SSH_PASS=""
  fi
}

if [[ -n "${LIVE_SSH_HOST:-}" ]]; then
  TARGET="${SSH_USER}@${LIVE_SSH_HOST}"
elif grep -qE "^Host[[:space:]]+${SSH_ALIAS}([[:space:]]|$)" "${HOME}/.ssh/config" 2>/dev/null; then
  TARGET="${SSH_ALIAS}"
else
  TARGET="${SSH_USER}@${SSH_HOST}"
fi

read_pass

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

print_remote_status() {
  echo ">>> Remote deploy status (${PROJECT_DIR}/.cd-state/deploy-status)"
  remote "bash '${PROJECT_DIR}/scripts/remote-deploy.sh' --status" 2>/dev/null \
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

# If a deploy is already running, report stage and exit (unless --force)
if [[ "${FORCE}" -eq 0 ]] && [[ "${RSYNC_ONLY}" -eq 0 ]]; then
  if remote_is_running; then
    echo ">>> A remote deploy is already running (terminal disconnect does not stop it)."
    print_remote_status
    echo ""
    echo "    yarn sync:live --status   # stage only"
    echo "    yarn sync:live --follow   # stream log"
    echo "    yarn sync:live --force    # kill + restart after new rsync"
    exit 0
  fi
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
  --exclude '.env.live' \
  --exclude '.env.production' \
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
  echo ">>> --rsync-only: skipping Docker / nginx"
  exit 0
fi

echo ">>> Starting DETACHED remote deploy (survives closed terminal)"
echo "    live :${LIVE_PORT} | nginx ${NGINX_DOMAIN} | LIVE_UI_MOCK=${LIVE_UI_MOCK}"

remote \
  SUDO_PASS="${SSH_PASS}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  GIT_SHA="${GIT_SHA}" \
  BUILD_TIME="${BUILD_TIME}" \
  LIVE_PORT="${LIVE_PORT}" \
  NGINX_DOMAIN="${NGINX_DOMAIN}" \
  CERTBOT_EMAIL="${CERTBOT_EMAIL:-}" \
  LIVE_UI_MOCK="${LIVE_UI_MOCK}" \
  'bash -s' <<'REMOTE_EOF'
set -euo pipefail
cd "${PROJECT_DIR}"
chmod +x scripts/*.sh scripts/lib/*.sh 2>/dev/null || true
mkdir -p .cd-state

if [[ ! -f scripts/remote-deploy.sh ]]; then
  echo "Error: scripts/remote-deploy.sh missing after rsync"
  exit 1
fi

# Detach: nohup + disown so SSH hangup does not kill the build
# Logging is owned by remote-deploy.sh (.cd-state/deploy.log)
nohup env \
  SUDO_PASS="${SUDO_PASS:-}" \
  PROJECT_DIR="${PROJECT_DIR}" \
  GIT_SHA="${GIT_SHA}" \
  BUILD_TIME="${BUILD_TIME}" \
  LIVE_PORT="${LIVE_PORT}" \
  NGINX_DOMAIN="${NGINX_DOMAIN}" \
  CERTBOT_EMAIL="${CERTBOT_EMAIL:-}" \
  LIVE_UI_MOCK="${LIVE_UI_MOCK:-0}" \
  bash "${PROJECT_DIR}/scripts/remote-deploy.sh" \
  >/dev/null 2>&1 &

echo $! > .cd-state/deploy.pid
disown || true
# Give remote-deploy a moment to write STATUS=running
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
echo ">>> Deploy is running on the server (you can close this terminal)."
echo "    Re-check stage:  yarn sync:live --status"
echo "    Stream log:      yarn sync:live --follow"
echo "    Force restart:   yarn sync:live --force"
if [[ "${LIVE_UI_MOCK}" == "1" ]]; then
  echo "    UI mock mode:    ON (FORCE_UI_DEV_MODE + mock BFF)"
fi
echo "    password_fallback=${USE_PASSWORD}"
