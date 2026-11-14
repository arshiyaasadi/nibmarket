# Release history — how Club FE was / is shipped

Keep this as the **historical record**. Day-to-day commands: [deploy.md](./deploy.md).

## Current policy (2026-11-14)

| Zone | Ship path | Auto CD? |
|------|-----------|----------|
| **dig / nibdev** | `yarn sync:dev` only (WireGuard + rsync + blue/green) | **No** — do not enable `mlm-cd-dev.timer` |
| **live / nibmarket** | `git push novin main` → `mlm-cd.timer` | **Yes** |

Live versioning: merge **`develop` → `main`**, then `git push novin main`. Dig is never advanced by git push alone.

---

## Era A — Laptop rsync (manual “نسخه”)

| Zone | Branch (intended) | Command | What it does |
|------|-------------------|---------|--------------|
| nibdev | `develop` (local tree) | `yarn sync:dev` | rsync → `/opt/MLM_Front`, `remote-deploy-dev.sh` (blue/green) |
| live | `main` | `yarn sync:live` | rsync → `/opt/MLM_Front`, `remote-deploy.sh` (compose + nginx `:80`) — **fallback** if live timer down |

**Files:** `scripts/sync-dev.sh`, `sync-live.sh`, `remote-deploy-dev.sh`, `remote-deploy.sh`, compose files, `deploy/nginx/club.nibmarket.com.conf`.

**Why dig stays Era A:** operator wants explicit dig releases; no host poll of `develop`.

---

## Era B — Azure git push → host poll (**live only**)

Repo remote **`novin`** = Azure DevOps `MLM_Front`.

| Zone | Branch | Host poller | Worker |
|------|--------|-------------|--------|
| **live** | `main` | `mlm-cd.timer` → `scripts/server-cd.sh` | `remote-deploy.sh` |
| nibdev | ~~`develop`~~ | ~~`mlm-cd-dev.timer`~~ | **Retired — do not enable** |

**Operator flow:**

1. Day-to-day → **`develop`** + dig via `yarn sync:dev` when needed
2. Live cut → merge `develop` → **`main`** → `git push novin main` → ~2 minutes live rebuilds
3. If live auto CD fails → `yarn sync:live` (WireGuard)

**Azure Pipelines** (`azure-pipelines.yml`): `trigger: none` — not the ship path.

Legacy dig poll scripts (`server-cd-dev.sh`, `deploy/mlm-cd-dev.*`) may remain in the repo for disable/cleanup only — **not** an intended path.

---

## Dig — ensure auto CD is OFF

If units were ever installed on `pod1`:

```bash
sudo systemctl disable --now mlm-cd-dev.timer 2>/dev/null || true
sudo systemctl stop mlm-cd-dev.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/mlm-cd-dev.timer /etc/systemd/system/mlm-cd-dev.service
sudo systemctl daemon-reload
systemctl is-enabled mlm-cd-dev.timer 2>&1 || echo "dig auto CD off (expected)"
```

From laptop: `yarn logs:dev` — timer section should show units missing / disabled.

**Do not** run `systemctl enable mlm-cd-dev.timer`.

---

## Live — enable auto CD once (WireGuard ON)

1. `/opt/MLM_Front` is a git checkout of Azure `MLM_Front`, branch **`main`**
2. `.cd-git-credentials` present if origin has no embedded creds
3. Install units (also done by `bootstrap-live-server.sh`):

```bash
sudo cp deploy/mlm-cd.service deploy/mlm-cd.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mlm-cd.timer
systemctl status mlm-cd.timer --no-pager
```

### Verify live poller

```bash
systemctl is-enabled mlm-cd.timer
systemctl is-active mlm-cd.timer
systemctl list-timers mlm-cd.timer --no-pager
journalctl -u mlm-cd.service -n 80 --no-pager
cat /opt/MLM_Front/.cd-state/last-deployed-sha
git -C /opt/MLM_Front rev-parse HEAD
git -C /opt/MLM_Front branch --show-current   # expect: main
```

From laptop: `yarn logs:live` → `logs/live/<timestamp>.txt`.

One-liner from Mac:

```bash
ssh nibmarket-live 'cd /opt/MLM_Front && sudo cp deploy/mlm-cd.service deploy/mlm-cd.timer /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now mlm-cd.timer && systemctl is-enabled mlm-cd.timer && systemctl list-timers mlm-cd.timer --no-pager'
```

---

## Fallback

| Zone | If … | Do |
|------|------|-----|
| dig | always | `yarn sync:dev` |
| live | timer / Azure fetch broken | `yarn sync:live` |
