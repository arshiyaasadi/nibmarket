# nibdev (development zone)

Staging / test zone for the Novin club panel. DNS and APIs use the **nibdev** brand.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibdev` (dev) |
| `APP_ENV` | `development` |
| Typical host | `pod1.nibdev.com` (alias `nibdev`) |
| Project dir on server | `/opt/MLM_Front` |

## URLs

| Role | URL |
|------|-----|
| Panel (legacy SSO) | https://panel.nibdev.com |
| Club panel (SSO callback) | https://club.nibdev.com |
| Club API | https://api-club.nibdev.com (`/api/v2`) |
| Account auth | https://auth.nibdev.com |

## Blue / green (rollback)

Exactly **two** app containers. No third proxy.

| Role | Container | Host publish |
|------|-----------|--------------|
| **Active** (public) | `mlm_front_dev_blue` **or** `mlm_front_dev_green` | `:3000` → container `3000` |
| **Standby** (previous) | the other slot | `127.0.0.1:2999` → container `3000` (localhost only — not on the public NIC) |

State file on server: `/opt/MLM_Front/.cd-state/slot-state` (`ACTIVE=blue|green`).

### Deploy flow

1. Build into the **inactive** slot on `127.0.0.1:2999`.
2. Health-check that bind.
3. Swap: new build → `:3000`, previous → `127.0.0.1:2999`.
4. Prune dangling images.

Cold start (no active container yet): builds the default slot (`blue`) directly on `:3000`. Standby appears on the next successful deploy.

### CLI (from laptop)

```bash
yarn sync:dev                 # UI mock by default (401 does not log out)
yarn sync:dev:ui              # explicit UI mock
yarn sync:dev:api             # real club BE when ready
yarn sync:dev --status        # deploy-status + slot-state + docker ps
yarn sync:dev --follow        # tail remote deploy.log
yarn sync:dev --rollback      # instant swap active ↔ standby (no rebuild)
yarn sync:dev --force         # kill stuck deploy lock, then deploy
yarn sync:dev:rollback        # same as --rollback
```

On server (same scripts):

```bash
bash scripts/remote-deploy-dev.sh --status
bash scripts/remote-deploy-dev.sh --rollback
```

## UI mock (default while BE is incomplete)

`yarn sync:dev` sets `FORCE_UI_DEV_MODE=1` + `API_SERVICE_MODE=mock`. The client ignores 401 logout/redirect in this mode. Switch to real API with `yarn sync:dev --api --force`.

## Stack on the dev host

| Compose | Env file | Project | Notes |
|---------|----------|---------|--------|
| `docker-compose.dev.yml` | `.env` | `mlm-dev` | services `app_blue` / `app_green` |

Requires Docker network name `nginx` (compose external network).

## Env on server

```bash
cp .env.example .env
# Ensure:
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
AUTH_SECRET=<long-random>
APP_PORT=3000
# After sync:dev (default mock): FORCE_UI_DEV_MODE=1, API_SERVICE_MODE=mock
```

Client URLs and UI-mock flags are baked at **image build**. Changing zone/mode requires rebuild.

`yarn sync:dev` patches server `.env` auth/SSO URLs:

- `NEXT_PUBLIC_APP_URL=https://club.nibdev.com` (SSO callback — never api-club)
- `NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com`
- `NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com`

## Related

- Live zone: [nibmarket.md](./nibmarket.md) → `yarn sync:live` (not blue/green yet)
- Env reference: [env.md](./env.md)
- Docs map: [../README.md](../README.md)
