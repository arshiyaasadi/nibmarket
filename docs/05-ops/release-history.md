# Release history — how Club FE was / is shipped

Keep this as the **historical record**. Day-to-day commands still live in [deploy.md](./deploy.md).

## Era A — Laptop rsync (manual “نسخه”) — still valid fallback

Until Azure git auto-CD is enabled on both hosts, operators ship with WireGuard + SSH:

| Zone | Branch (intended) | Command | What it does |
|------|-------------------|---------|--------------|
| nibdev | `develop` | `yarn sync:dev` | rsync tree → `/opt/MLM_Front`, run `remote-deploy-dev.sh` (blue/green) |
| live | `main` | `yarn sync:live` | rsync tree → `/opt/MLM_Front`, run `remote-deploy.sh` (compose + nginx `:80`) |

**Files involved (not secrets):**

- `scripts/sync-dev.sh`, `scripts/sync-live.sh`
- `scripts/remote-deploy-dev.sh`, `scripts/remote-deploy.sh`
- `docker-compose.dev.yml`, `docker-compose.live.yml`
- `deploy/nginx/club.nibmarket.com.conf`
- Local gitignored: `live_ssh_pass.txt`, `sudo_pass.txt`, `git_credentials.txt`

**Why it existed:** Azure DevOps / private DNS often unreachable without WireGuard; Azure Pipelines in-repo stayed `trigger: none`.

## Era B — Azure git push → host poll (target auto CD)

Repo remote **`novin`** = Azure DevOps `MLM_Front`. Hosts already (or will) clone that remote under `/opt/MLM_Front`.

| Zone | Branch | Host poller | Worker |
|------|--------|-------------|--------|
| live | `main` | `mlm-cd.timer` → `scripts/server-cd.sh` | `remote-deploy.sh` |
| nibdev | `develop` | `mlm-cd-dev.timer` → `scripts/server-cd-dev.sh` | `remote-deploy-dev.sh` |

**Operator flow going forward:**

1. Day-to-day work → PRs into **`develop`**
2. `git push novin develop` → within ~2 minutes nibdev rebuilds
3. When ready for live: merge `develop` → **`main`**, `git push novin main` → live rebuilds

**Azure Pipelines YAML** (`azure-pipelines.yml`) is intentionally not the ship path; the ship path is **git push to Azure Repos** + systemd timers on the app hosts.

## Enable checklist (one-time, WireGuard ON)

### Live (`club-docker` / `nibmarket-live`)

1. Ensure `/opt/MLM_Front` is a git checkout of Azure `MLM_Front`, branch `main`
2. `.cd-git-credentials` present (user + PAT) if origin has no embedded creds
3. Units installed (also done by `bootstrap-live-server.sh`):

```bash
sudo cp deploy/mlm-cd.service deploy/mlm-cd.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mlm-cd.timer
systemctl status mlm-cd.timer
```

### nibdev (`pod1` / `nibdev`)

1. Same checkout; track **`develop`**
2. Same `.cd-git-credentials`
3. Adjust `User=` in `deploy/mlm-cd-dev.service` if the host user is not `arshia`
4. Install:

```bash
sudo cp deploy/mlm-cd-dev.service deploy/mlm-cd-dev.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mlm-cd-dev.timer
systemctl status mlm-cd-dev.timer
```

### Verify push-only CD is actually polling (on host)

```bash
systemctl is-enabled mlm-cd-dev.timer
systemctl is-active mlm-cd-dev.timer
systemctl list-timers mlm-cd-dev.timer --no-pager
journalctl -u mlm-cd-dev.service -n 40 --no-pager
cat /opt/MLM_Front/.cd-state/last-deployed-sha-dev
git -C /opt/MLM_Front rev-parse HEAD
git -C /opt/MLM_Front branch --show-current
```

From laptop (WireGuard ON): `yarn logs:dev` — same facts land in `logs/dev/<timestamp>.txt`.

**Symptom:** `git push novin develop` succeeded but dig still shows old `GIT_SHA` in deploy-status, and `yarn sync:dev --follow` says no deploy running → timer is **not** enabled (or fetch credentials failed). Either enable the timer (above) or run Era A `yarn sync:dev` once.

## Fallback

If timers or Azure fetch fail: use Era A (`yarn sync:dev` / `yarn sync:live`) — do not delete those scripts.
