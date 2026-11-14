# Deploy (two stable zones)

Both zones are **working**. Deploy from a laptop over WireGuard; no Azure/git push for day-to-day releases.

| Zone | Brand | Command | Details |
|------|-------|---------|---------|
| **dev / dig** | nibdev | `yarn sync:dev` | [nibdev.md](./nibdev.md) — blue/green `:3000` / `127.0.0.1:2999` |
| **live** | nibmarket | `yarn sync:live` | [nibmarket.md](./nibmarket.md) — `:3000` + nginx origin `:80` behind CDN |

## Git branch policy (auto CD via Azure Repos)

Primary remote for releases: **`novin`** (Azure DevOps `MLM_Front`). Hosts poll that remote every ~2 minutes.

| Branch | Role | Auto deploy |
|--------|------|-------------|
| **`develop`** | Day-to-day work | Push → **nibdev** (`club.nibdev.com`) via `mlm-cd-dev.timer` / `server-cd-dev.sh` |
| **`main`** | Live baseline | Push → **nibmarket** (`club.nibmarket.com`) via `mlm-cd.timer` / `server-cd.sh` |

Workflow:

1. Feature work → merge into **`develop`** → `git push novin develop`
2. Live cut → merge **`develop` → `main`** → `git push novin main`

Fallback (WireGuard laptop): `yarn sync:dev` / `yarn sync:live` — see [release-history.md](./release-history.md).

Notes:

- Azure Pipelines YAML stays `trigger: none` (ship path is git push + host timers, not cloud agents).
- Feature branches target **`develop`**, not `main`.
- First-time timer enable steps: [release-history.md](./release-history.md).

Env / presets: [env.md](./env.md) · Live log collection (paste for agent): [`scripts/live-logs-prompt.md`](../../scripts/live-logs-prompt.md)

## Shared prerequisites

1. WireGuard on
2. SSH: alias `nibdev` / `nibmarket-live` (or `DEV_SSH_HOST` / `LIVE_SSH_HOST`)
3. Server project path: `/opt/MLM_Front`
4. External Docker network named `nginx`

## Dev (nibdev) — summary

```bash
yarn sync:dev                 # rsync + blue/green (real API) — Era A fallback
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

```bash
yarn sync:live
yarn sync:live --force
yarn sync:live:status
yarn sync:live:follow
yarn logs:live                # pull deploy + container snapshot to logs/live/
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
| Worker | `scripts/remote-deploy.sh` |
| Nginx template | `deploy/nginx/club.nibmarket.com.conf` |

Live smoke after nginx:  
`Host: club.nibmarket.com` → `http://127.0.0.1/build-info.json` must be **200** (not 301).

## SSO (both zones)

Correct flow (same as legacy `startAuthEntry`):

```
CTA / landing
  → panel…/login/?callbackUrl=<club>/login/sso/?returnUrl=…
  → back to club /login/sso/
  → BFF session
  → /dashboard
```

- Live static landing (`public/landing-v2`): links go to panel + `callbackUrl` (not bare `/login`).
- Live: `NEXT_PUBLIC_PUBLIC_ORIGIN=https://club.nibmarket.com` is baked at image build.
- Dev: origin from the request (`club.nibdev.com`).
- Never point the callback at `club-srv` / `api-club`.

## Remote stages (quick reference)

| Live | Dev |
|------|-----|
| `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `done` | build inactive slot on `2999` → health → swap to `:3000` → `done` |

Status: `.cd-state/deploy-status` (+ dev: `.cd-state/slot-state`).

## Do not change

- Live: certbot on `club.nibmarket.com` → CDN redirect loop
- Live: `BACKEND_API_BASE_URL` stays `http://club-srv…` (not https)
- Dev: UI mock off by default (`API_SERVICE_MODE=api`)
- Public app port in both zones: **3000**
