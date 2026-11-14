# Deploy (two stable zones)

| Zone | Brand | How to ship | Details |
|------|-------|-------------|---------|
| **dev / dig** | nibdev | **Manual only:** `yarn sync:dev` | [nibdev.md](./nibdev.md) — blue/green `:3000` / `127.0.0.1:2999` |
| **live** | nibmarket | **Target auto:** `git push novin main` → `mlm-cd.timer` | [nibmarket.md](./nibmarket.md) — break-glass: `yarn sync:live` |

## Git branch policy

Primary remote for **live auto CD**: **`novin`** (Azure DevOps `MLM_Front`).  
GitHub (`github`) is the day-to-day remote; **pushing GitHub alone does not deploy live.**

| Branch | Role | Deploy |
|--------|------|--------|
| **`develop`** | Day-to-day work | **No** server auto CD. Dig = `yarn sync:dev` (WireGuard). |
| **`main`** | Live baseline | Auto: `git push novin main` → `mlm-cd.timer` → `server-cd.sh` → `remote-deploy.sh` |

### Workflow (preferences)

1. Feature work → merge into **`develop`** → `git push github develop`
2. Dig preview: WireGuard ON → `yarn sync:dev` → `yarn logs:dev` / dig `/api/ping`
3. Live cut:
   - merge **`develop` → `main`** → `git push github main`
   - **also** `git push novin main` (required for auto CD)
   - wait ~2m → verify ping-pong
   - if auto path fails → **`yarn sync:live`** (manual versioning)

Notes:

- Azure Pipelines YAML stays `trigger: none`.
- Dig must **not** run `mlm-cd-dev.timer` — [release-history.md](./release-history.md).
- Live timer enable + post-mortem of the 2026-11-14 cut: [release-history.md](./release-history.md).

Env / presets: [env.md](./env.md) · Store plan: Project Agent Store `docs/club-auto-cd-azure-plan.md`

## Shared prerequisites

1. WireGuard on (Azure DNS, dig sync, live SSH / timer install)
2. SSH: alias `nibdev` / `nibmarket-live` (or `DEV_SSH_HOST` / `LIVE_SSH_HOST`)
3. Server project path: `/opt/MLM_Front`
4. External Docker network named `nginx`

## Dev (nibdev) — summary

```bash
yarn sync:dev                 # only dig ship path
yarn sync:dev --status
yarn sync:dev --follow        # tails only; does not start deploy
yarn sync:dev --rollback
yarn sync:dev --force
yarn logs:dev
```

| | |
|--|--|
| Host | `pod1.nibdev.com` |
| Public | https://club.nibdev.com |
| BE | `https://api-club.nibdev.com` |
| Compose | `docker-compose.dev.yml` → blue/green |
| Worker | `scripts/remote-deploy-dev.sh` |
| Auto CD | **Off** |

## Live (nibmarket) — summary

**Target versioning** = merge develop→main + **`git push novin main`** (Azure tip) + `mlm-cd.timer`.

### 2026-11-14 cut (what happened)

- GitHub `main` already had tip `5476954`; live stayed on `3ff8582` until **manual** `yarn sync:live`.
- Root cause: Azure `novin/main` was not updated (VPN/DNS / push skipped) — timer had nothing new to deploy.
- Old live build also lacked ping `cd` block (added in that tip); `.cd` looked null until the new build landed.

### Verify (ping-pong)

```bash
# Tip you expect:
git rev-parse --short main

# After auto or manual ship (~2m for timer):
curl -sS https://club.nibmarket.com/api/ping | jq '{git:.version.git, deploy:.deploy, cd:.cd}'
# UI: profile → درباره اپلیکیشن → refresh
yarn logs:live                # → logs/live/<ts>.txt
```

Expect `version.git` (and `deploy.gitSha` when present) to match tip; on new builds `cd.autoCdExpected === true`.

### Commands

```bash
# Preferred auto path (WireGuard + Azure reachable):
git push novin main
# wait ~2m, then ping / logs:live

# Confirm Azure tip matches local:
git ls-remote novin refs/heads/main

# Break-glass (this cut’s working path):
yarn sync:live
yarn sync:live --force
# SKIP_NGINX=1 yarn sync:live   # only when host nginx must not change
```

### Checklist before relying on push-only next time

1. WireGuard ON  
2. `git push novin main` succeeded; `git ls-remote novin refs/heads/main` == tip  
3. `systemctl is-enabled mlm-cd.timer` → `enabled` on live host  
4. Wait ~2m → `/api/ping` matches tip  
5. If not: journal `mlm-cd.service`, then break-glass `yarn sync:live`

| | |
|--|--|
| Host | `club-docker.nibmarket.com` (`nibmarket-live`) |
| Public | https://club.nibmarket.com |
| App | `mlm_front_live` → `:3000` |
| Origin nginx | **HTTP `:80` only** → `127.0.0.1:3000` |
| Compose | `docker-compose.live.yml` + `.env.live` |
| Auto CD | `mlm-cd.timer` → `server-cd.sh` → `remote-deploy.sh` |
| Ping-pong | `GET /api/ping` + profile «درباره اپلیکیشن» |

## Related

- [release-history.md](./release-history.md) — eras, enable/disable, incident notes  
- [nibdev.md](./nibdev.md) · [nibmarket.md](./nibmarket.md)
