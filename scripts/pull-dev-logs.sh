#!/usr/bin/env bash
#
# pull-dev-logs.sh — copy a dig/nibdev debug snapshot onto this machine.
#
# WireGuard must be on (same SSH path as yarn sync:dev).
# Writes logs/dev/<timestamp>.txt and prints that path.
#
# Includes deploy status/log, blue/green slots, git SHA/branch, and
# mlm-cd-dev.timer / service state (push-only CD poller).
#
#   yarn logs:dev
#   DEV_SSH_HOST=<host> yarn logs:dev
#
set -euo pipefail

SSH_HOST="${DEV_SSH_HOST:-pod1.nibdev.com}"
SSH_USER="${DEV_SSH_USER:-}"
SSH_ALIAS="${DEV_SSH_ALIAS:-nibdev}"
SSH_KEY="${DEV_SSH_KEY:-}"
PROJECT_DIR="${DEV_PROJECT_DIR:-/opt/MLM_Front}"
APP_PORT="${DEV_APP_PORT:-3000}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/sudo_pass.txt"
LIVE_PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"
OUT_DIR="${REPO_ROOT}/logs/dev"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${OUT_DIR}/${STAMP}.txt"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: required command not found: $1"
    exit 1
  }
}

need_cmd ssh

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

SSH_PASS=""
if [[ -s "${PASS_FILE}" ]]; then
  SSH_PASS="$(tr -d '\r\n' < "${PASS_FILE}")"
elif [[ -s "${LIVE_PASS_FILE}" ]]; then
  SSH_PASS="$(tr -d '\r\n' < "${LIVE_PASS_FILE}")"
fi

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ConnectTimeout=15)
if [[ -n "${SSH_KEY}" && -f "${SSH_KEY}" ]]; then
  SSH_OPTS+=(-i "${SSH_KEY}" -o IdentitiesOnly=yes)
fi

if ssh "${SSH_OPTS[@]}" -o BatchMode=yes "${TARGET}" 'true' 2>/dev/null; then
  echo ">>> SSH key auth OK → ${TARGET}"
  remote() { ssh "${SSH_OPTS[@]}" "${TARGET}" "$@"; }
elif [[ -n "${SSH_PASS}" ]]; then
  need_cmd sshpass
  echo ">>> Falling back to password auth → ${TARGET}"
  export SSHPASS="${SSH_PASS}"
  remote() {
    sshpass -e ssh "${SSH_OPTS[@]}" -o PreferredAuthentications=password -o PubkeyAuthentication=no "${TARGET}" "$@"
  }
else
  echo "Error: cannot reach ${TARGET}."
  echo "  1) Turn WireGuard ON (novin_arsia). A full-tunnel VPN such as V2BOX blocks this host."
  echo "  2) Or: DEV_SSH_HOST=<host> yarn logs:dev"
  echo "  3) Or create ${PASS_FILE} / fix SSH key"
  exit 1
fi

mkdir -p "${OUT_DIR}"
echo ">>> Collecting dig/nibdev snapshot → ${OUT_FILE}"

remote "PROJECT_DIR='${PROJECT_DIR}' APP_PORT='${APP_PORT}' bash -s" <<'REMOTE' 2>&1 | tee "${OUT_FILE}"
set +e
echo "===== HOST / TIME ====="
hostname
date -u
date
whoami
echo
echo "===== GIT (push-only CD source) ====="
cd "${PROJECT_DIR}" 2>/dev/null || true
pwd
git -C "${PROJECT_DIR}" rev-parse --is-inside-work-tree 2>/dev/null || echo "not a git checkout"
git -C "${PROJECT_DIR}" branch --show-current 2>/dev/null || true
git -C "${PROJECT_DIR}" rev-parse HEAD 2>/dev/null || true
git -C "${PROJECT_DIR}" remote -v 2>/dev/null | head -5
echo
echo "===== LAST DEPLOYED SHA (auto CD) ====="
if [[ -f "${PROJECT_DIR}/.cd-state/last-deployed-sha-dev" ]]; then
  cat "${PROJECT_DIR}/.cd-state/last-deployed-sha-dev"
else
  echo "missing (.cd-state/last-deployed-sha-dev) — timer never deployed, or Era A rsync only"
fi
echo
echo "===== DEPLOY STATUS ====="
if [[ -f "${PROJECT_DIR}/.cd-state/deploy-status" ]]; then
  cat "${PROJECT_DIR}/.cd-state/deploy-status"
else
  echo "STATUS=missing"
fi
echo
echo "===== SLOT STATE ====="
if [[ -f "${PROJECT_DIR}/.cd-state/slot-state" ]]; then
  cat "${PROJECT_DIR}/.cd-state/slot-state"
else
  echo "missing"
fi
echo
echo "===== DEPLOY LOG (last 250) ====="
if [[ -f "${PROJECT_DIR}/.cd-state/deploy.log" ]]; then
  tail -n 250 "${PROJECT_DIR}/.cd-state/deploy.log"
else
  echo "no deploy.log"
fi
echo
echo "===== mlm-cd-dev.timer (push-only CD) ====="
systemctl is-enabled mlm-cd-dev.timer 2>&1 || true
systemctl is-active mlm-cd-dev.timer 2>&1 || true
systemctl list-timers mlm-cd-dev.timer --no-pager 2>&1 || true
ls -la /etc/systemd/system/mlm-cd-dev.* 2>&1 || echo "units not installed under /etc/systemd/system/"
echo
echo "===== mlm-cd-dev.service (last runs) ====="
systemctl status mlm-cd-dev.service --no-pager -l 2>&1 | head -40 || true
echo
echo "===== journalctl mlm-cd-dev (last 80) ====="
journalctl -u mlm-cd-dev.service -n 80 --no-pager 2>&1 || true
echo
echo "===== CONTAINERS ====="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -40
echo
echo "===== COMPOSE (mlm-dev) ====="
cd "${PROJECT_DIR}" 2>/dev/null || true
docker compose -p mlm-dev -f docker-compose.dev.yml ps -a 2>/dev/null || true
echo
echo "===== APP LOGS blue/green (last 120 each) ====="
docker logs --tail=120 mlm_front_dev_blue 2>/dev/null || echo "no mlm_front_dev_blue"
echo "-----"
docker logs --tail=120 mlm_front_dev_green 2>/dev/null || echo "no mlm_front_dev_green"
echo
echo "===== APP CHECK :${APP_PORT} ====="
curl -sS -o /dev/null -w "app:${APP_PORT} /build-info.json %{http_code}\n" --max-time 8 "http://127.0.0.1:${APP_PORT}/build-info.json" || echo "app curl failed"
curl -sS --max-time 8 "http://127.0.0.1:${APP_PORT}/build-info.json" || true
echo
echo "===== DONE ====="
REMOTE

echo ""
echo ">>> Saved ${OUT_FILE}"
echo ">>> Tip: if timer is disabled, push alone will NOT deploy — see docs/05-ops/release-history.md"
