# Environment Variables

## Preset + override model

Zone URLs live in [`src/config/env-presets.ts`](../../src/config/env-presets.ts).

See also the docs map: [`../README.md`](../README.md).
`.env` holds **zone**, **secrets**, and optional **overrides**.

| Zone | `APP_ENV` | Backend / panel / auth | Front (public) |
|------|-----------|------------------------|----------------|
| **dev** (nibdev) | `development` | `api-club.nibdev.com` / `panel.nibdev.com` / `auth.nibdev.com` | Host from request — typically `club.nibdev.com` — [nibdev.md](./nibdev.md) |
| **live** (nibmarket) | `production` | `club-srv.nibmarket.com` / `panel.nibmarket.com` / `auth.nibmarket.com` | Host from request — typically `club.nibmarket.com` — [nibmarket.md](./nibmarket.md) |

Shared constants (`BACKEND_API_VERSION=v2`, SSO cookie, callback path) are in the same preset.

**Important:** Club front origin is **not** an env var. SSO callback and invite links use `window.location.origin` / request `Host` (+ `X-Forwarded-*`). Never point SSO at the club backend.

Any non-empty optional var in `.env` overrides the preset.

---

## Env files

| File | Use |
|------|-----|
| `.env.example` | Dev / local template — `APP_ENV=development` |
| `.env.live.example` | Live server template — `APP_ENV=production` |
| `.env` | Dev host / local runtime (gitignored) |
| `.env.live` | Live host runtime (gitignored) |
| `.env.local` | Local Next.js overrides |

```bash
cp .env.example .env
# live host:
cp .env.live.example .env.live
```

---

## Config modules (Zod)

| File | Scope | Content |
|------|-------|---------|
| `src/config/env-presets.ts` | shared | Zone backend / panel / auth URLs + constants |
| `src/config/public-origin.ts` | client + server | Front origin from browser / request |
| `src/config/env.server.ts` | server-only | `APP_ENV`, auth, backend, SSO check |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | For components |

---

## Required in `.env` / `.env.live`

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
| `UI_DEV_MODE` / `NEXT_PUBLIC_UI_DEV_MODE` | no | Local UI mocks + auth bypass (ignored in production `NODE_ENV`) |
| `AUTH_SECRET` | yes | ≥ 32 chars |
| `APP_PORT` | no | Host port (default `3000` for dig and live) |

### Optional overrides

```env
BACKEND_API_BASE_URL=
SSO_CHECK_TOKEN_URL=
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com
NEXT_PUBLIC_PANEL_BASE_URL=
```

---

## API service mode

| Value | Behavior |
|-------|----------|
| `mock` | BFF handlers + in-memory fixtures |
| `api` | Proxy all `/api/v2/*` to external club backend |

Local UI without backend:

```env
UI_DEV_MODE=1
NEXT_PUBLIC_UI_DEV_MODE=1
```

---

## Docker and deploy

Only **two** stacks:

| Zone | Compose | Env | Container | Port | Command |
|------|---------|-----|-----------|------|---------|
| **dev** | `docker-compose.dev.yml` | `.env` | `mlm_front_dev_blue` / `_green` (active `:3000`, standby `127.0.0.1:2999`) | 3000 | `yarn sync:dev` / `--rollback` |
| **live** | `docker-compose.live.yml` | `.env.live` | `mlm_front_live` | 3000 | `yarn sync:live` |

Club API path is always **`/api/v2`** (BFF + backend). External **panel/auth** hosts still use their own `/api/v1` paths — those are not club API.

### Build-time vs runtime

- Server vars: runtime from env file
- `NEXT_PUBLIC_APP_ENV`: baked at image **build** — change zone → rebuild

```bash
# live
docker compose -p mlm-live -f docker-compose.live.yml --env-file .env.live up -d --build
# dig
docker compose -p mlm-dev -f docker-compose.dev.yml --env-file .env up -d --build
```

### Continuous deploy (WireGuard)

```bash
yarn sync:live              # rsync + detached remote build
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

Remote worker: `scripts/remote-deploy.sh`  
nginx: `deploy/nginx/club.nibmarket.com.conf` → host `:3000`

Dev: `yarn sync:dev` → `scripts/remote-deploy-dev.sh`

Zone docs: [nibdev.md](./nibdev.md) · [nibmarket.md](./nibmarket.md)

---

## Usage in code

```ts
import { serverEnv } from "@/config/env.server";
import { env } from "@/config/env";
import { getBrowserOrigin, getRequestOrigin } from "@/config/public-origin";
```

## Security

- Never put `AUTH_SECRET` / `SUPER_ADMIN_*` under `NEXT_PUBLIC_`
- Use strong secrets in live
- Import `env.server.ts` only in server context
