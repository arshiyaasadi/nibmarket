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
yarn sync:dev                 # rsync + blue/green deploy (real API)
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

## Real API (default)

nibdev deploy always uses **club BE** (`API_SERVICE_MODE=api`) and hard-clears UI-mock flags (`FORCE_UI_DEV_MODE=0`, …) so the panel does not serve «کاربر تست» fixtures. BFF only keeps session-cookie routes (+ admin geo fixture) local; all other `/api/v2` calls proxy to `api-club.nibdev.com`.

### Test flag: keep session on 401

`NEXT_PUBLIC_KEEP_SESSION_ON_401=1` — a 401 does **not** clear the session or redirect to session-expired (`src/config/feature-flags.ts`).

### Blue / green ports

| Role | Host publish |
|------|----------------|
| **Active** (public, new build after swap) | `:3000` |
| **Standby** (previous good build) | `127.0.0.1:2999` |

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
API_SERVICE_MODE=api
AUTH_SECRET=<long-random>
APP_PORT=3000
# Test (nibdev): NEXT_PUBLIC_KEEP_SESSION_ON_401=1
```

Client URLs / public flags are baked at **image build**. Changing them requires rebuild.

`yarn sync:dev` patches server `.env` auth/SSO URLs:

- `NEXT_PUBLIC_APP_URL=https://club.nibdev.com` (SSO callback — never api-club)
- `NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com`
- `NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com`

## Related

- Live zone: [nibmarket.md](./nibmarket.md) → `yarn sync:live` (not blue/green yet)
- Env reference: [env.md](./env.md)
- Docs map: [../README.md](../README.md)
