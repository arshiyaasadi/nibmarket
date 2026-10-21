# Environment Variables

Zone URLs: [`src/config/env-presets.ts`](../../src/config/env-presets.ts).  
Deploy for both zones: [deploy.md](./deploy.md) · map: [`../README.md`](../README.md).

`.env` holds **zone**, **secrets**, and optional overrides only.

| Zone | `APP_ENV` | Backend / panel / auth | Front (public) |
|------|-----------|------------------------|----------------|
| **dev** (nibdev) | `development` | `https://api-club.nibdev.com` / `panel.nibdev.com` / `auth.nibdev.com` | From request — typically `club.nibdev.com` — [nibdev.md](./nibdev.md) |
| **live** (nibmarket) | `production` | `http://club-srv.nibmarket.com` / `panel.nibmarket.com` / `auth.nibmarket.com` | Fixed SSO origin: `https://club.nibmarket.com` — [nibmarket.md](./nibmarket.md) |

Shared constants (`BACKEND_API_VERSION=v2`, SSO cookie, callback path) live in the same preset.

**Live:** callback and invite links use `https://club.nibmarket.com` (`getPublicClubOrigin()` / `NEXT_PUBLIC_PUBLIC_ORIGIN`), even if you open the app via `club-docker:3000`. Never point SSO at the club backend.

Any non-empty var in `.env` / `.env.live` overrides the preset.

---

## Env files

| File | Use |
|------|-----|
| `.env.example` | Dev / local template — `APP_ENV=development` |
| `.env.live.example` | Live template — `APP_ENV=production` |
| `.env` | Dev / local runtime (gitignored) |
| `.env.live` | Live runtime (gitignored) |
| `.env.local` | Local Next.js overrides |

```bash
cp .env.example .env
# live host:
cp .env.live.example .env.live
```

Deploy automatically patches auth/SSO/backend via `scripts/lib/patch-auth-env.sh`.

---

## Config modules (Zod)

| File | Scope | Content |
|------|-------|---------|
| `src/config/env-presets.ts` | shared | Zone backend / panel / auth + constants |
| `src/config/public-origin.ts` | client + server | Front origin (live bake / dev request) |
| `src/config/env.server.ts` | server-only | `APP_ENV`, auth, backend, SSO check |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | For components |

---

## Required

```env
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=dev_only_auth_secret_for_nibclub_please_change
```

| Variable | Required | Notes |
|----------|----------|-------|
| `APP_ENV` | yes | `development` or `production` |
| `NEXT_PUBLIC_APP_ENV` | yes | Must match `APP_ENV` |
| `API_SERVICE_MODE` | yes | `mock` or `api` |
| `UI_DEV_MODE` / `NEXT_PUBLIC_UI_DEV_MODE` | no | Local UI mocks (ignored when `NODE_ENV=production`) |
| `AUTH_SECRET` | yes | ≥ 32 chars |
| `APP_PORT` | no | Default `3000` (dev and live) |
| `NEXT_PUBLIC_PUBLIC_ORIGIN` | live yes (set by deploy) | `https://club.nibmarket.com` |
| `BACKEND_API_BASE_URL` | live: HTTP club-srv | dev: https api-club |

### Optional overrides

```env
BACKEND_API_BASE_URL=
SSO_CHECK_TOKEN_URL=
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com
NEXT_PUBLIC_PANEL_BASE_URL=
NEXT_PUBLIC_PUBLIC_ORIGIN=
```

---

## API service mode

| Value | Behavior |
|-------|----------|
| `mock` | BFF + in-memory fixtures |
| `api` | Proxy `/api/v2/*` to club BE |

Local without backend:

```env
UI_DEV_MODE=1
NEXT_PUBLIC_UI_DEV_MODE=1
```

---

## Docker and deploy

| Zone | Compose | Env | Container | Port | Command |
|------|---------|-----|-----------|------|---------|
| **dev** | `docker-compose.dev.yml` | `.env` | `mlm_front_dev_blue` / `_green` (active `:3000`, standby `127.0.0.1:2999`) | 3000 | `yarn sync:dev` / `--rollback` |
| **live** | `docker-compose.live.yml` | `.env.live` | `mlm_front_live` | 3000 | `yarn sync:live` |

Club API is always **`/api/v2`**. External panel/auth hosts keep their own `/api/v1` paths.

### Build-time vs runtime

- Server vars: from env file at runtime
- `NEXT_PUBLIC_APP_ENV` / live `NEXT_PUBLIC_PUBLIC_ORIGIN`: baked at **image build**

```bash
# live
docker compose -p mlm-live -f docker-compose.live.yml --env-file .env.live up -d --build
# dig
docker compose -p mlm-dev -f docker-compose.dev.yml --env-file .env up -d --build
```

### Continuous deploy

```bash
yarn sync:dev               # dig — blue/green
yarn sync:live              # live — rsync + detached remote
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

- Live worker: `scripts/remote-deploy.sh` — nginx HTTP `:80`→`:3000` (no certbot; CDN = HTTPS)
- Dev worker: `scripts/remote-deploy-dev.sh`
- Live template: `deploy/nginx/club.nibmarket.com.conf`

Details: [deploy.md](./deploy.md) · [nibdev.md](./nibdev.md) · [nibmarket.md](./nibmarket.md)

---

## Usage in code

```ts
import { serverEnv } from "@/config/env.server";
import { env } from "@/config/env";
import { getBrowserOrigin, getRequestOrigin } from "@/config/public-origin";
```

## Security

- Never put `AUTH_SECRET` / `SUPER_ADMIN_*` under `NEXT_PUBLIC_`
- Use strong secrets on live
- Import `env.server.ts` only in server context
