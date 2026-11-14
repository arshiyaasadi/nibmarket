# Release history — how Club FE was / is shipped

Keep this as the **historical record**. Day-to-day commands: [deploy.md](./deploy.md).

## Current policy (2026-11-14)

| Zone | Ship path | Auto CD? |
|------|-----------|----------|
| **dig / nibdev** | `yarn sync:dev` only (WireGuard + rsync + blue/green) | **No** — do not enable `mlm-cd-dev.timer` |
| **live / nibmarket** | **Target:** `git push novin main` → `mlm-cd.timer` | **Yes** (when Azure tip is current) |
| live break-glass | `yarn sync:live` | Manual rsync path |

Live versioning target: merge **`develop` → `main`**, push **GitHub and Azure (`novin`)**, wait for timer.  
Dig is never advanced by git push alone.

**Important:** Live polls **Azure**, not GitHub. `git push github main` alone will not move live.

---

## Incident log — 2026-11-14 first “auto” live cut

| | |
|--|--|
| GitHub | `develop` + `main` at tip `5476954` (merge OK) |
| Live before fix | Stuck on `3ff8582` (~26 commits behind) |
| Auto pipeline | **Failed to ship** — `novin/main` never got the tip (no successful Azure push / VPN DNS) |
| What worked | Manual **`yarn sync:live`** |
| Ping `.cd` | Null/missing on old build; `cd` arrives only after new ping-pong code is deployed |

Timer may have been enabled; without a new Azure tip it correctly did nothing.

---

## Era A — Laptop rsync (manual “نسخه”)

| Zone | Branch (intended) | Command | What it does |
|------|-------------------|---------|--------------|
| nibdev | local tree | `yarn sync:dev` | rsync → `/opt/MLM_Front`, `remote-deploy-dev.sh` |
| live | `main` tip (local) | `yarn sync:live` | rsync → `/opt/MLM_Front`, `remote-deploy.sh` — **fallback / this cut’s ship path** |

**Why dig stays Era A:** explicit dig releases; no host poll of `develop`.

---

## Era B — Azure git push → host poll (**live only**, target)

Repo remote **`novin`** = Azure DevOps `MLM_Front`.

| Zone | Branch | Host poller | Worker |
|------|--------|-------------|--------|
| **live** | `main` | `mlm-cd.timer` → `scripts/server-cd.sh` | `remote-deploy.sh` |
| nibdev | ~~`develop`~~ | ~~`mlm-cd-dev.timer`~~ | **Retired — do not enable** |

**Operator flow (when push-only works):**

1. Day-to-day → **`develop`** + dig via `yarn sync:dev` when needed  
2. Live cut → merge → **`main`** → **`git push novin main`** → ~2 minutes  
3. Verify `/api/ping` + optional `yarn logs:live`  
4. If auto fails → `yarn sync:live`

---

## Dig — ensure auto CD is OFF

```bash
sudo systemctl disable --now mlm-cd-dev.timer 2>/dev/null || true
sudo systemctl stop mlm-cd-dev.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/mlm-cd-dev.timer /etc/systemd/system/mlm-cd-dev.service
sudo systemctl daemon-reload
systemctl is-enabled mlm-cd-dev.timer 2>&1 || echo "dig auto CD off (expected)"
```

**Do not** enable `mlm-cd-dev.timer`.

---

## Live — enable auto CD once + next-cut checklist

### Enable (WireGuard ON)

```bash
sudo cp deploy/mlm-cd.service deploy/mlm-cd.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mlm-cd.timer
systemctl status mlm-cd.timer --no-pager
```

One-liner:

```bash
ssh nibmarket-live 'cd /opt/MLM_Front && sudo cp deploy/mlm-cd.service deploy/mlm-cd.timer /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now mlm-cd.timer && systemctl is-enabled mlm-cd.timer'
```

### Before trusting push-only next time

1. WireGuard ON (Azure DNS resolves)  
2. `git push novin main` + `git ls-remote novin refs/heads/main` matches tip  
3. `systemctl is-enabled mlm-cd.timer` → enabled  
4. Host checkout tracks `main`; `.cd-git-credentials` OK if needed  
5. Wait ~2m → `curl -sS https://club.nibmarket.com/api/ping` → `version.git` + `deploy` + `cd`  
6. Else journal + **`yarn sync:live`**

### Verify poller / ping

```bash
systemctl is-enabled mlm-cd.timer
journalctl -u mlm-cd.service -n 80 --no-pager
cat /opt/MLM_Front/.cd-state/last-deployed-sha
git -C /opt/MLM_Front rev-parse --short HEAD

curl -sS https://club.nibmarket.com/api/ping | jq '{git:.version.git, deploy:.deploy, cd:.cd}'
yarn logs:live
```

---

## Fallback

| Zone | If … | Do |
|------|------|-----|
| dig | always | `yarn sync:dev` |
| live | Azure tip missing / timer broken / push-only fails | `yarn sync:live` |
