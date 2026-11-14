# Deploy (two stable zones)

| Zone | Brand | How to ship | Details |
|------|-------|-------------|---------|
| **dev / dig** | nibdev | **Manual only:** `yarn sync:dev` | [nibdev.md](./nibdev.md) — blue/green `:3000` / `127.0.0.1:2999` |
| **live** | nibmarket | **Auto:** push `main` to Azure `novin` | [nibmarket.md](./nibmarket.md) — `:3000` + nginx origin `:80` behind CDN |

## Git branch policy

Primary remote for **live** releases: **`novin`** (Azure DevOps `MLM_Front`).

| Branch | Role | Deploy |
|--------|------|--------|
| **`develop`** | Day-to-day work | **No** server auto CD. Ship dig with `yarn sync:dev` (WireGuard). |
| **`main`** | Live baseline | Push → **nibmarket** via `mlm-cd.timer` → `server-cd.sh` → `remote-deploy.sh` |

### Workflow (preferences)

1. Feature work → merge into **`develop`** → push github (and Azure `novin develop` if useful for backup — dig will **not** auto-deploy).
2. Dig preview: WireGuard ON → `yarn sync:dev` → optional `yarn sync:dev --follow` / `yarn logs:dev`.
3. Live cut: merge **`develop` → `main`** → `git push novin main` → wait ~2m for `mlm-cd.timer` (fallback: `yarn sync:live`).

Notes:

- Azure Pipelines YAML stays `trigger: none` (live ship path is git push + **live** host timer only).
- Feature branches target **`develop`**, not `main`.
- Dig must **not** run `mlm-cd-dev.timer` — see [release-history.md](./release-history.md) (disable if present).
- Live timer enable (one-time): [release-history.md](./release-history.md).

Env / presets: [env.md](./env.md) · Live log collection: [`scripts/live-logs-prompt.md`](../../scripts/live-logs-prompt.md)

## Shared prerequisites

1. WireGuard on (for SSH / dig sync / first-time live timer install)
2. SSH: alias `nibdev` / `nibmarket-live` (or `DEV_SSH_HOST` / `LIVE_SSH_HOST`)
3. Server project path: `/opt/MLM_Front`
4. External Docker network named `nginx`

## Dev (nibdev) — summary

```bash
yarn sync:dev                 # only supported dig ship path (rsync + blue/green)
yarn sync:dev --status
yarn sync:dev --follow        # tails only; does not start deploy
yarn sync:dev --rollback      # instant swap, no rebuild
yarn sync:dev --force
yarn logs:dev                 # pull dig snapshot → logs/dev/*.txt
yarn logs:live                # pull live snapshot → logs/live/*.txt
```

| | |
|--|--|
| Host | `pod1.nibdev.com` |
| Public | https://club.nibdev.com |
| BE | `https://api-club.nibdev.com` |
| Panel SSO | https://panel.nibdev.com → callback `https://club.nibdev.com/login/sso/` |
| Compose | `docker-compose.dev.yml` + `.env` → `mlm_front_dev_blue` / `_green` |
| Worker | `scripts/remote-deploy-dev.sh` |

## Live (nibmarket) — summary

**Versioning = merge develop→main + `git push novin main`.** Host polls `main` every ~2 minutes.

```bash
# After push to Azure main (preferred):
yarn logs:live                # confirm SHA / deploy status
yarn sync:live:status
yarn sync:live:follow         # tails only

# Fallback if timer not enabled / stuck:
yarn sync:live
yarn sync:live --force
# SKIP_NGINX=1 yarn sync:live   # only when host nginx must not change
```

| | |
|--|--|
| Host | `club-docker.nibmarket.com` (`nibmarket-live`) |
| Public | https://club.nibmarket.com (Arvan CDN → origin `:80`) |
| App | `mlm_front_live` → `:3000` |
| Origin nginx | **HTTP `:80` only** → `127.0.0.1:3000` — **no certbot** |
| BE | `http://club-srv.nibmarket.com` (internal HTTP) |
| Panel SSO | https://panel.nibmarket.com → callback `https://club.nibmarket.com/login/sso/` |
| Compose | `docker-compose.live.yml` + `.env.live` |
| Auto CD | `mlm-cd.timer` → `scripts/server-cd.sh` → `remote-deploy.sh` |

## Related

- [release-history.md](./release-history.md) — dig manual vs live auto, enable/disable checklists
- Store plan: Project Agent Store `docs/club-auto-cd-azure-plan.md`
