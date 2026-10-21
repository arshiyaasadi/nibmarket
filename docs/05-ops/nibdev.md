# nibdev (development / dig)

Dev zone is stable. Two-zone overview: [deploy.md](./deploy.md).

Staging / test zone under the **nibdev** brand.

## Identity

| Key | Value |
|-----|--------|
| Zone | `nibdev` (dev / dig) |
| `APP_ENV` | `development` |
| Host / SSH | `pod1.nibdev.com` / alias `nibdev` |
| Project dir | `/opt/MLM_Front` |

## URLs

| Role | URL |
|------|-----|
| Club (public) | https://club.nibdev.com |
| Club API | https://api-club.nibdev.com (`/api/v2`) |
| Panel SSO | https://panel.nibdev.com |
| Account auth | https://auth.nibdev.com |
| SSO callback | `https://club.nibdev.com/login/sso/` (origin from request) |

## Blue / green

Exactly **two** app containers. No third proxy.

| Role | Container | Host publish |
|------|-----------|--------------|
| **Active** (public) | `mlm_front_dev_blue` **or** `_green` | `:3000` → container `3000` |
| **Standby** (previous) | the other slot | `127.0.0.1:2999` → container `3000` (localhost only) |

State: `/opt/MLM_Front/.cd-state/slot-state` (`ACTIVE=blue|green`).

### Deploy flow

1. Build into the **inactive** slot on `127.0.0.1:2999`
2. Health-check
3. Swap: new build → `:3000`, previous → `127.0.0.1:2999`
4. Prune dangling images

Cold start (no active yet): default slot (`blue`) builds directly on `:3000`. Standby appears on the next successful deploy.

### CLI

```bash
yarn sync:dev                 # rsync + blue/green (real API)
yarn sync:dev --status
yarn sync:dev --follow
yarn sync:dev --rollback      # instant swap, no rebuild
yarn sync:dev --force
yarn sync:dev:rollback
```

On the server:

```bash
bash scripts/remote-deploy-dev.sh --status
bash scripts/remote-deploy-dev.sh --rollback
```

## Real API (default)

Always `API_SERVICE_MODE=api` with UI-mock cleared (`FORCE_UI_DEV_MODE=0`, …). BFF keeps only session-cookie routes (+ admin geo fixture) local; all other `/api/v2` calls proxy to `api-club.nibdev.com`.

### Test flag: keep session on 401

`NEXT_PUBLIC_KEEP_SESSION_ON_401=1` — a 401 does **not** clear the session or redirect to session-expired (`src/config/feature-flags.ts`).

## Stack

| Compose | Env | Project | Notes |
|---------|-----|---------|--------|
| `docker-compose.dev.yml` | `.env` | `mlm-dev` | `app_blue` / `app_green` |

Requires external Docker network `nginx`.

## Env on server

```bash
cp .env.example .env
# Ensure:
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=<long-random>
APP_PORT=3000
# Optional test: NEXT_PUBLIC_KEEP_SESSION_ON_401=1
```

`NEXT_PUBLIC_*` flags are baked at **image build**; changing zone requires rebuild.

`yarn sync:dev` patches server `.env` with:

- `BACKEND_API_BASE_URL=https://api-club.nibdev.com`
- `NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com`
- `NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com`
- (front origin from request; `NEXT_PUBLIC_PUBLIC_ORIGIN` is intentionally not set)

## Related

- [deploy.md](./deploy.md) · live: [nibmarket.md](./nibmarket.md) · [env.md](./env.md)
