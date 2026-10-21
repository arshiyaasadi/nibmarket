# Environment Variables

Zone URLs: [`src/config/env-presets.ts`](../../src/config/env-presets.ts).  
Deploy هر دو زون: [deploy.md](./deploy.md) · map: [`../README.md`](../README.md).

`.env` فقط **zone**، **secrets**، و overrideهای اختیاری.

| Zone | `APP_ENV` | Backend / panel / auth | Front (public) |
|------|-----------|------------------------|----------------|
| **دو** (nibdev) | `development` | `https://api-club.nibdev.com` / `panel.nibdev.com` / `auth.nibdev.com` | از request — معمولاً `club.nibdev.com` — [nibdev.md](./nibdev.md) |
| **لایو** (nibmarket) | `production` | `http://club-srv.nibmarket.com` / `panel.nibmarket.com` / `auth.nibmarket.com` | ثابت SSO: `https://club.nibmarket.com` — [nibmarket.md](./nibmarket.md) |

ثابت‌های مشترک (`BACKEND_API_VERSION=v2`، SSO cookie، callback path) در همان preset.

**لایو:** callback و لینک دعوت از `https://club.nibmarket.com` می‌آید (`getPublicClubOrigin()` / `NEXT_PUBLIC_PUBLIC_ORIGIN`)، حتی اگر اپ را از `club-docker:3000` باز کنی. هرگز SSO را به club BE نزن.

هر var غیرخالی در `.env` / `.env.live` preset را override می‌کند.

---

## Env files

| File | Use |
|------|-----|
| `.env.example` | قالب دو / لوکال — `APP_ENV=development` |
| `.env.live.example` | قالب لایو — `APP_ENV=production` |
| `.env` | runtime دو / لوکال (gitignored) |
| `.env.live` | runtime لایو (gitignored) |
| `.env.local` | override لوکال Next |

```bash
cp .env.example .env
# live host:
cp .env.live.example .env.live
```

دیپلوی خودکار پچ auth/SSO/backend را با `scripts/lib/patch-auth-env.sh` می‌زند.

---

## Config modules (Zod)

| File | Scope | Content |
|------|-------|---------|
| `src/config/env-presets.ts` | shared | Zone backend / panel / auth + constants |
| `src/config/public-origin.ts` | client + server | Front origin (لایو bake / دو request) |
| `src/config/env.server.ts` | server-only | `APP_ENV`, auth, backend, SSO check |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | برای کامپوننت‌ها |

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
| `APP_ENV` | yes | `development` یا `production` |
| `NEXT_PUBLIC_APP_ENV` | yes | باید با `APP_ENV` یکی باشد |
| `API_SERVICE_MODE` | yes | `mock` یا `api` |
| `UI_DEV_MODE` / `NEXT_PUBLIC_UI_DEV_MODE` | no | mock UI لوکال (در `NODE_ENV=production` نادیده) |
| `AUTH_SECRET` | yes | ≥ 32 chars |
| `APP_PORT` | no | پیش‌فرض `3000` (دو و لایو) |
| `NEXT_PUBLIC_PUBLIC_ORIGIN` | لایو yes (دیپلوی ست می‌کند) | `https://club.nibmarket.com` |
| `BACKEND_API_BASE_URL` | لایو: HTTP club-srv | دو: https api-club |

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
| `mock` | BFF + fixture حافظه |
| `api` | پروکسی `/api/v2/*` به club BE |

لوکال بدون بک‌اند:

```env
UI_DEV_MODE=1
NEXT_PUBLIC_UI_DEV_MODE=1
```

---

## Docker and deploy

| Zone | Compose | Env | Container | Port | Command |
|------|---------|-----|-----------|------|---------|
| **دو** | `docker-compose.dev.yml` | `.env` | `mlm_front_dev_blue` / `_green` (active `:3000`, standby `127.0.0.1:2999`) | 3000 | `yarn sync:dev` / `--rollback` |
| **لایو** | `docker-compose.live.yml` | `.env.live` | `mlm_front_live` | 3000 | `yarn sync:live` |

Club API همیشه **`/api/v2`**. پنل/auth نیب مسیرهای `/api/v1` خودشان را دارند.

### Build-time vs runtime

- Server vars: از env file در runtime
- `NEXT_PUBLIC_APP_ENV` / لایو `NEXT_PUBLIC_PUBLIC_ORIGIN`: در **بیلد** ایمیج

```bash
# live
docker compose -p mlm-live -f docker-compose.live.yml --env-file .env.live up -d --build
# dig
docker compose -p mlm-dev -f docker-compose.dev.yml --env-file .env up -d --build
```

### Continuous deploy

```bash
yarn sync:dev               # دو — blue/green
yarn sync:live              # لایو — rsync + detached remote
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

- لایو worker: `scripts/remote-deploy.sh` — nginx HTTP `:80`→`:3000` (بدون certbot؛ CDN = HTTPS)
- دو worker: `scripts/remote-deploy-dev.sh`
- Template لایو: `deploy/nginx/club.nibmarket.com.conf`

جزئیات: [deploy.md](./deploy.md) · [nibdev.md](./nibdev.md) · [nibmarket.md](./nibmarket.md)

---

## Usage in code

```ts
import { serverEnv } from "@/config/env.server";
import { env } from "@/config/env";
import { getBrowserOrigin, getRequestOrigin } from "@/config/public-origin";
```

## Security

- هرگز `AUTH_SECRET` / `SUPER_ADMIN_*` را زیر `NEXT_PUBLIC_` نگذار
- لایو: secret قوی
- `env.server.ts` فقط در context سرور
