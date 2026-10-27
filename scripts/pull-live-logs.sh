#!/usr/bin/env bash
#
# pull-live-logs.sh — copy a live debug snapshot onto this machine.
#
# WireGuard must be on (same SSH path as yarn sync:live).
# Writes logs/live/<timestamp>.txt and prints that path.
#
#   yarn logs:live
#   LIVE_SSH_HOST=<ip> yarn logs:live
#
set -euo pipefail

SSH_HOST="${LIVE_SSH_HOST:-club-docker.nibmarket.com}"
SSH_USER="${LIVE_SSH_USER:-novin}"
SSH_ALIAS="${LIVE_SSH_ALIAS:-nibmarket-live}"
SSH_KEY="${LIVE_SSH_KEY:-${HOME}/.ssh/nibmarket_live_ed25519}"
PROJECT_DIR="${LIVE_PROJECT_DIR:-/opt/MLM_Front}"
LIVE_PORT="${LIVE_PORT:-${PROD_PORT:-3000}}"
NGINX_DOMAIN="${NGINX_DOMAIN:-club.nibmarket.com}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"
OUT_DIR="${REPO_ROOT}/logs/live"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${OUT_DIR}/${STAMP}.txt"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: required command not found: $1"
    exit 1
  }
}

need_cmd ssh

if [[ -n "${LIVE_SSH_HOST:-}" ]]; then
  TARGET="${SSH_USER}@${LIVE_SSH_HOST}"
elif grep -qE "^Host[[:space:]]+${SSH_ALIAS}([[:space:]]|$)" "${HOME}/.ssh/config" 2>/dev/null; then
  TARGET="${SSH_ALIAS}"
else
  TARGET="${SSH_USER}@${SSH_HOST}"
fi

SSH_PASS=""
if [[ -s "${PASS_FILE}" ]]; then
  SSH_PASS="$(tr -d '\r\n' < "${PASS_FILE}")"
fi

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ConnectTimeout=15)
if [[ -f "${SSH_KEY}" ]]; then
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
  echo "  2) Or: LIVE_SSH_HOST=<ip> yarn logs:live"
  echo "  3) Or create ${PASS_FILE} / fix SSH key"
  exit 1
fi

mkdir -p "${OUT_DIR}"
echo ">>> Collecting live snapshot → ${OUT_FILE}"

remote "PROJECT_DIR='${PROJECT_DIR}' LIVE_PORT='${LIVE_PORT}' NGINX_DOMAIN='${NGINX_DOMAIN}' bash -s" <<'REMOTE' 2>&1 | tee "${OUT_FILE}"
set +e
echo "===== HOST / TIME ====="
hostname
date -u
date
echo
echo "===== DEPLOY STATUS ====="
if [[ -f "${PROJECT_DIR}/.cd-state/deploy-status" ]]; then
  cat "${PROJECT_DIR}/.cd-state/deploy-status"
else
  echo "STATUS=missing"
fi
echo
echo "===== DEPLOY LOG (last 250) ====="
if [[ -f "${PROJECT_DIR}/.cd-state/deploy.log" ]]; then
  tail -n 250 "${PROJECT_DIR}/.cd-state/deploy.log"
else
  echo "no deploy.log"
fi
echo
echo "===== CONTAINERS ====="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -40
echo
echo "===== COMPOSE ====="
cd "${PROJECT_DIR}" 2>/dev/null || true
pwd
docker compose -p mlm-live -f docker-compose.live.yml ps -a 2>/dev/null || true
echo
echo "===== APP LOGS (last 200) ====="
docker logs --tail=200 mlm_front_live 2>/dev/null || echo "no mlm_front_live logs"
echo
echo "===== ORIGIN CHECKS ====="
curl -sS -o /dev/null -w "app:${LIVE_PORT} /build-info.json %{http_code}\n" --max-time 8 "http://127.0.0.1:${LIVE_PORT}/build-info.json" || echo "app curl failed"
curl -sS --max-time 8 "http://127.0.0.1:${LIVE_PORT}/build-info.json" || true
echo
curl -sS -o /dev/null -w "origin /build-info.json %{http_code}\n" --max-time 8 -H "Host: ${NGINX_DOMAIN}" "http://127.0.0.1/build-info.json" || echo "origin curl failed"
echo
echo "===== NGINX ERROR (last 40) ====="
tail -n 40 /var/log/nginx/error.log 2>/dev/null || sudo -n tail -n 40 /var/log/nginx/error.log 2>/dev/null || echo "nginx error log not readable"
echo
echo "===== DONE ====="
REMOTE

echo ""
echo ">>> Saved ${OUT_FILE}"
