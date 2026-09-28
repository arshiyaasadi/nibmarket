#!/usr/bin/env bash
#
# bootstrap-live-server.sh — one-shot setup for the nibmarket LIVE host
#
# What it does (from your Mac):
#   1) Create a dedicated SSH key (ed25519) if missing
#   2) Install the public key on the server (password auth once via sshpass)
#   3) Add a Host entry to ~/.ssh/config for easy `ssh nibmarket-live`
#   4) On the server: install Docker (+ compose) if missing, create nginx network
#   5) Clone (or update) the Azure DevOps repo into PROJECT_DIR
#   6) Seed .env.live from .env.live.example when missing
#   7) Build & start with docker compose (production)
#
# Required local files (repo root, gitignored):
#   live_ssh_pass.txt     — SSH / sudo password for the live host (one line)
#   git_credentials.txt   — line 1: git username, line 2: password/PAT
#
# Usage:
#   ./scripts/bootstrap-live-server.sh              # full bootstrap + deploy
#   ./scripts/bootstrap-live-server.sh --ssh-only    # key + ssh config only
#   ./scripts/bootstrap-live-server.sh --deploy-only # skip key setup; pull+build
#
# After key setup:
#   ssh nibmarket-live
#
set -euo pipefail

# ---------- defaults (override with env) ----------
# Override host if DNS name is wrong / private, e.g.:
#   LIVE_SSH_HOST=31.14.114.131 ./scripts/bootstrap-live-server.sh
SSH_HOST="${LIVE_SSH_HOST:-club-docker.nibmarket.com}"
SSH_USER="${LIVE_SSH_USER:-novin}"
SSH_ALIAS="${LIVE_SSH_ALIAS:-nibmarket-live}"
SSH_KEY="${LIVE_SSH_KEY:-${HOME}/.ssh/nibmarket_live_ed25519}"
PROJECT_DIR="${LIVE_PROJECT_DIR:-/opt/MLM_Front}"
GIT_REPO_URL="${LIVE_GIT_REPO:-https://azure.nibdev.com/GeneralCollection/Club/_git/MLM_Front}"
GIT_BRANCH="${LIVE_GIT_BRANCH:-main}"
COMPOSE_FILE="${LIVE_COMPOSE_FILE:-docker-compose.live.yml}"
DEPLOY_APP_ENV="${LIVE_APP_ENV:-production}"
# -------------------------------------------------

# Fail fast with a clear DNS hint (common when hostname is internal-only)
if ! getent hosts "${SSH_HOST}" >/dev/null 2>&1 && ! dig +short "${SSH_HOST}" A 2>/dev/null | grep -q .; then
  echo "Warning: cannot resolve ${SSH_HOST} from this machine (NXDOMAIN / no DNS)."
  echo "  If you have the server IP, re-run with: LIVE_SSH_HOST=<ip> $0 $*"
  echo "  Continuing anyway — SSH may still work via VPN / private DNS..."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PASS_FILE="${REPO_ROOT}/live_ssh_pass.txt"
GIT_CREDENTIALS_FILE="${REPO_ROOT}/git_credentials.txt"

MODE="full"
case "${1:-}" in
  --ssh-only) MODE="ssh-only" ;;
  --deploy-only) MODE="deploy-only" ;;
  --help|-h)
    sed -n '2,30p' "$0"
    exit 0
    ;;
  "") ;;
  *)
    echo "Unknown option: $1 (use --ssh-only | --deploy-only | --help)"
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
need_cmd ssh-keygen
need_cmd ssh-keyscan

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

read_pass() {
  if [[ ! -s "${PASS_FILE}" ]]; then
    echo "Error: missing ${PASS_FILE}"
    echo "Create it with one line: the SSH password for ${SSH_USER}@${SSH_HOST}"
    exit 1
  fi
  SSH_PASS="$(tr -d '\r\n' < "${PASS_FILE}")"
  if [[ -z "${SSH_PASS}" ]]; then
    echo "Error: ${PASS_FILE} is empty"
    exit 1
  fi
}

read_git_creds() {
  if [[ ! -s "${GIT_CREDENTIALS_FILE}" ]]; then
    echo "Error: missing ${GIT_CREDENTIALS_FILE}"
    echo "Format: line 1 = username, line 2 = password or PAT"
    exit 1
  fi
  GIT_USER="$(sed -n '1p' "${GIT_CREDENTIALS_FILE}" | tr -d '\r')"
  GIT_PASS="$(sed -n '2p' "${GIT_CREDENTIALS_FILE}" | tr -d '\r')"
  if [[ -z "${GIT_USER}" || -z "${GIT_PASS}" ]]; then
    echo "Error: git_credentials.txt must have username (L1) and password/PAT (L2)"
    exit 1
  fi
}

ensure_sshpass() {
  if command -v sshpass >/dev/null 2>&1; then
    return 0
  fi
  echo ">>> sshpass not found — trying brew install..."
  if command -v brew >/dev/null 2>&1; then
    brew install hudochenkov/sshpass/sshpass 2>/dev/null || brew install esolitos/ipa/sshpass 2>/dev/null || brew install sshpass
  else
    echo "Error: install sshpass (brew install hudochenkov/sshpass/sshpass)"
    exit 1
  fi
}

ssh_with_pass() {
  SSHPASS="${SSH_PASS}" sshpass -e ssh \
    -o StrictHostKeyChecking=accept-new \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    "$@"
}

ssh_with_key() {
  ssh -i "${SSH_KEY}" \
    -o IdentitiesOnly=yes \
    -o StrictHostKeyChecking=accept-new \
    "$@"
}

setup_local_key() {
  if [[ ! -f "${SSH_KEY}" ]]; then
    echo ">>> Generating SSH key: ${SSH_KEY}"
    ssh-keygen -t ed25519 -f "${SSH_KEY}" -N "" -C "nibmarket-live-$(whoami)@$(hostname -s 2>/dev/null || echo local)"
  else
    echo ">>> Reusing existing key: ${SSH_KEY}"
  fi
  chmod 600 "${SSH_KEY}"
  chmod 644 "${SSH_KEY}.pub"
}

install_key_on_server() {
  ensure_sshpass
  read_pass
  echo ">>> Ensuring host key for ${SSH_HOST}"
  mkdir -p "${HOME}/.ssh"
  chmod 700 "${HOME}/.ssh"
  ssh-keyscan -H "${SSH_HOST}" >> "${HOME}/.ssh/known_hosts" 2>/dev/null || true

  local PUB
  PUB="$(cat "${SSH_KEY}.pub")"
  echo ">>> Installing public key on ${SSH_USER}@${SSH_HOST}"
  ssh_with_pass "${SSH_USER}@${SSH_HOST}" bash -s <<REMOTE_KEY
set -euo pipefail
mkdir -p "\$HOME/.ssh"
chmod 700 "\$HOME/.ssh"
touch "\$HOME/.ssh/authorized_keys"
chmod 600 "\$HOME/.ssh/authorized_keys"
if ! grep -qxF '${PUB}' "\$HOME/.ssh/authorized_keys" 2>/dev/null; then
  echo '${PUB}' >> "\$HOME/.ssh/authorized_keys"
  echo "--- Public key appended"
else
  echo "--- Public key already present"
fi
REMOTE_KEY

  echo ">>> Verifying key login..."
  ssh_with_key "${SSH_USER}@${SSH_HOST}" 'echo "--- Key auth OK as $(whoami)@$(hostname)"'
}

write_ssh_config() {
  local CFG="${HOME}/.ssh/config"
  mkdir -p "${HOME}/.ssh"
  touch "${CFG}"
  chmod 600 "${CFG}"

  if grep -qE "^Host[[:space:]]+${SSH_ALIAS}([[:space:]]|$)" "${CFG}" 2>/dev/null; then
    echo ">>> SSH config Host ${SSH_ALIAS} already exists — leaving as-is"
    return 0
  fi

  echo ">>> Appending Host ${SSH_ALIAS} to ${CFG}"
  cat >> "${CFG}" <<EOF

# nibmarket live (added by scripts/bootstrap-live-server.sh)
Host ${SSH_ALIAS}
  HostName ${SSH_HOST}
  User ${SSH_USER}
  IdentityFile ${SSH_KEY}
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 4
EOF
}

remote_bootstrap_and_deploy() {
  read_pass
  read_git_creds

  local GIT_USER_ENC GIT_PASS_ENC AUTH_URL HOST_PATH
  GIT_USER_ENC="$(urlencode "${GIT_USER}")"
  GIT_PASS_ENC="$(urlencode "${GIT_PASS}")"
  HOST_PATH="${GIT_REPO_URL#*://}"
  HOST_PATH="${HOST_PATH#*@}"
  AUTH_URL="https://${GIT_USER_ENC}:${GIT_PASS_ENC}@${HOST_PATH}"

  echo ">>> Running remote bootstrap + deploy on ${SSH_USER}@${SSH_HOST}"
  echo "    PROJECT_DIR=${PROJECT_DIR}"
  echo "    BRANCH=${GIT_BRANCH}  COMPOSE=${COMPOSE_FILE}  APP_ENV=${DEPLOY_APP_ENV}"

  # Prefer key; fall back to password for first connect if key not ready
  local SSH_CMD=(ssh_with_key)
  if ! ssh_with_key -o BatchMode=yes -o ConnectTimeout=8 "${SSH_USER}@${SSH_HOST}" 'true' 2>/dev/null; then
    echo ">>> Key auth not ready — using password for this session"
    ensure_sshpass
    SSH_CMD=(ssh_with_pass)
  fi

  "${SSH_CMD[@]}" "${SSH_USER}@${SSH_HOST}" \
    SUDO_PASS="${SSH_PASS}" \
    PROJECT_DIR="${PROJECT_DIR}" \
    GIT_REPO_URL="${GIT_REPO_URL}" \
    AUTH_URL="${AUTH_URL}" \
    GIT_USER="${GIT_USER}" \
    GIT_PASS="${GIT_PASS}" \
    GIT_BRANCH="${GIT_BRANCH}" \
    COMPOSE_FILE="${COMPOSE_FILE}" \
    DEPLOY_APP_ENV="${DEPLOY_APP_ENV}" \
    'bash -s' <<'REMOTE_EOF'
set -euo pipefail

sudo_run() {
  if command -v sudo >/dev/null 2>&1; then
    echo "${SUDO_PASS}" | sudo -S -p '' "$@"
  else
    "$@"
  fi
}

echo "=== [1/6] System packages (curl, git, ca-certificates) ==="
if command -v apt-get >/dev/null 2>&1; then
  sudo_run apt-get update -y
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git gnupg lsb-release
elif command -v dnf >/dev/null 2>&1; then
  sudo_run dnf install -y curl git ca-certificates
elif command -v yum >/dev/null 2>&1; then
  sudo_run yum install -y curl git ca-certificates
fi

echo "=== [2/6] Docker ==="
install_docker_apt() {
  # Prefer Ubuntu packages — get.docker.com is often 403 from IR / restricted nets
  sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 || \
    sudo_run DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose || true
}

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

if command -v docker >/dev/null 2>&1; then
  echo "--- Docker already installed: $(docker --version)"
else
  echo "--- Installing Docker from Ubuntu apt (avoids get.docker.com 403)"
  install_docker_apt
  if ! command -v docker >/dev/null 2>&1; then
    echo "--- apt install failed — trying get.docker.com as fallback"
    if curl -fsSL https://get.docker.com -o /tmp/get-docker.sh; then
      sudo_run sh /tmp/get-docker.sh || true
      rm -f /tmp/get-docker.sh
    else
      echo "Warning: get.docker.com blocked (403/network)"
    fi
  fi
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is not installed. On Ubuntu: sudo apt install -y docker.io docker-compose-v2"
  exit 1
fi

if getent group docker >/dev/null 2>&1; then
  sudo_run usermod -aG docker "$(whoami)" || true
fi

if docker compose version >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1; then
  echo "--- docker compose OK"
else
  echo "--- Installing docker compose via apt"
  install_docker_apt
  if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
    echo "Error: docker compose still missing"
    exit 1
  fi
fi

sudo_run systemctl enable --now docker 2>/dev/null || true

echo "=== [3/6] External docker network: nginx ==="
if sudo_run docker network inspect nginx >/dev/null 2>&1; then
  echo "--- network nginx exists"
else
  sudo_run docker network create nginx
  echo "--- network nginx created"
fi

echo "=== [4/6] Project directory ${PROJECT_DIR} ==="
PARENT="$(dirname "${PROJECT_DIR}")"
sudo_run mkdir -p "${PARENT}"
if [[ ! -d "${PROJECT_DIR}/.git" ]]; then
  echo "--- Cloning ${GIT_REPO_URL} → ${PROJECT_DIR}"
  if [[ -d "${PROJECT_DIR}" ]] && [[ -n "$(ls -A "${PROJECT_DIR}" 2>/dev/null || true)" ]]; then
    echo "Error: ${PROJECT_DIR} exists but is not a git repo and is not empty"
    exit 1
  fi
  sudo_run rm -rf "${PROJECT_DIR}"
  sudo_run git clone --branch "${GIT_BRANCH}" "${AUTH_URL}" "${PROJECT_DIR}"
else
  echo "--- Repo exists — fetching ${GIT_BRANCH}"
fi

sudo_run chown -R "$(whoami):$(id -gn)" "${PROJECT_DIR}" || true
cd "${PROJECT_DIR}"
git -c "safe.directory=${PROJECT_DIR}" remote set-url origin "${GIT_REPO_URL}" || true

GIT=(git -C "${PROJECT_DIR}" -c "safe.directory=${PROJECT_DIR}")
"${GIT[@]}" fetch "${AUTH_URL}" "${GIT_BRANCH}"
"${GIT[@]}" checkout "${GIT_BRANCH}" 2>/dev/null || "${GIT[@]}" checkout -B "${GIT_BRANCH}"
"${GIT[@]}" reset --hard "FETCH_HEAD"
SYNCED="$("${GIT[@]}" rev-parse --short HEAD)"
echo "--- Synced to: ${SYNCED}"

echo "=== [5/6] Env files (live) ==="
seed_secret() {
  local file="$1"
  if grep -q 'AUTH_SECRET=<generate' "${file}" 2>/dev/null || grep -qE '^AUTH_SECRET=$' "${file}" 2>/dev/null; then
    SECRET="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p | tr -d '\n' | head -c 48)"
    sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" "${file}" && rm -f "${file}.bak"
    echo "--- Generated AUTH_SECRET in ${file}"
  fi
}

if [[ ! -f .env.live ]]; then
  if [[ -f .env.live.example ]]; then
    cp .env.live.example .env.live
  elif [[ -f .env.production ]]; then
    cp .env.production .env.live
  elif [[ -f .env ]]; then
    cp .env .env.live
  else
    cp .env.example .env.live 2>/dev/null || true
  fi
  seed_secret .env.live
  echo "--- Seeded .env.live (nibmarket DNS / APP_ENV=production)"
else
  echo "--- Keeping existing .env.live"
fi

# Legacy alias for older docs/scripts
if [[ ! -f .env ]]; then
  cp .env.live .env
fi

# Git credentials for on-server CD poller (WireGuard-safe)
printf '%s\n%s\n' "${GIT_USER}" "${GIT_PASS}" > "${PROJECT_DIR}/.cd-git-credentials"
chmod 600 "${PROJECT_DIR}/.cd-git-credentials"
echo "--- Wrote .cd-git-credentials for server-cd.sh"

echo "=== [6/6] Live deploy (:3002) ==="
export GIT_SHA="${SYNCED}"
export BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export NEXT_PUBLIC_GIT_SHA="${SYNCED}"
export LIVE_PORT=3002 NGINX_DOMAIN=club.nibmarket.ir
chmod +x "${PROJECT_DIR}/scripts/remote-deploy.sh" 2>/dev/null || true
# Prefer the detachable remote-deploy path (same as yarn sync:live)
SUDO_PASS="${SUDO_PASS}" PROJECT_DIR="${PROJECT_DIR}" GIT_SHA="${SYNCED}" BUILD_TIME="${BUILD_TIME}" \
  bash "${PROJECT_DIR}/scripts/remote-deploy.sh"

echo "=== CD timer (poll git every 2m — works behind WireGuard) ==="
chmod +x "${PROJECT_DIR}/scripts/server-cd.sh" 2>/dev/null || true
if [[ -f "${PROJECT_DIR}/deploy/mlm-cd.service" && -f "${PROJECT_DIR}/deploy/mlm-cd.timer" ]]; then
  sudo_run cp "${PROJECT_DIR}/deploy/mlm-cd.service" /etc/systemd/system/mlm-cd.service
  sudo_run cp "${PROJECT_DIR}/deploy/mlm-cd.timer" /etc/systemd/system/mlm-cd.timer
  # Allow novin to run docker without password for CD
  echo "novin ALL=(root) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose" | sudo_run tee /etc/sudoers.d/mlm-cd >/dev/null
  sudo_run chmod 440 /etc/sudoers.d/mlm-cd
  sudo_run systemctl daemon-reload
  sudo_run systemctl enable --now mlm-cd.timer
  echo "--- mlm-cd.timer enabled"
  # Record current SHA so timer does not immediately rebuild
  mkdir -p "${PROJECT_DIR}/.cd-state"
  echo "$("${GIT[@]}" rev-parse HEAD)" > "${PROJECT_DIR}/.cd-state/last-deployed-sha"
else
  echo "Warning: deploy/mlm-cd.*.{service,timer} missing — skip CD install"
fi

echo ">>> Remote bootstrap + deploy finished."
echo ">>> live → host :3002 (club.nibmarket.ir) | container mlm_front_live"
echo ">>> CD: systemctl status mlm-cd.timer"
REMOTE_EOF
}

# ---------- main ----------
echo ">>> LIVE host: ${SSH_USER}@${SSH_HOST}  alias=${SSH_ALIAS}"
echo ">>> Mode: ${MODE}"

case "${MODE}" in
  ssh-only)
    setup_local_key
    install_key_on_server
    write_ssh_config
    ;;
  deploy-only)
    remote_bootstrap_and_deploy
    ;;
  full)
    setup_local_key
    install_key_on_server
    write_ssh_config
    remote_bootstrap_and_deploy
    ;;
esac

echo ""
echo ">>> Done."
echo "    ssh ${SSH_ALIAS}"
echo "    # or: ssh -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST}"
echo "    Project: ${PROJECT_DIR}"
echo "    Re-deploy later: ./scripts/bootstrap-live-server.sh --deploy-only"
echo "    Or existing: yarn sync:live"
