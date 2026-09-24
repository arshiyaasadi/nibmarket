# Environment Variables

## مدل preset + override

URLهای ثابت هر zone در [`src/config/env-presets.ts`](../src/config/env-presets.ts) تعریف شده‌اند.
فایل `.env` فقط **zone**، **secrets** و در صورت نیاز **override** را نگه می‌دارد.

| Zone | `APP_ENV` | دامنه backend / app | دامنه panel |
|------|-----------|---------------------|-------------|
| development (nibdev) | `development` | `https://api-club.nibdev.com` | `https://panel.nibdev.com` |
| production (nibmarket) | `production` | `https://api-club.nibmarket.com` | `https://panel.nibmarket.com` |

مقادیر مشترک (مثل `BACKEND_API_VERSION=v2`، cookie SSO، مسیر callback) هم در همان preset هستند.

هر متغیر اختیاری در `.env` اگر مقدار داشته باشد، بر preset اولویت دارد.

---

## فایل‌های env

| فایل | کاربرد |
|------|--------|
| `.env.example` | مرجع local/staging — `APP_ENV=development` |
| `.env.production.example` | template سرور live — `APP_ENV=production` |
| `.env` | runtime روی سرور / Docker (gitignored) |
| `.env.local` | override محلی Next.js (مثلاً `NEXT_PUBLIC_APP_URL=http://localhost:3000`) |

کپی اولیه:

```bash
cp .env.example .env
# یا برای live:
cp .env.production.example .env
```

---

## فایل‌های config (Zod)

| فایل | جایگاه | محتوا |
|------|---------|-------|
| `src/config/env-presets.ts` | shared | URLها و ثابت‌های هر zone |
| `src/config/env.server.ts` | server-only | `APP_ENV`، auth، backend، SSO check |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | برای components |

---

## متغیرهای الزامی در `.env`

```env
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=dev_only_auth_secret_for_nibclub_please_change
```

| متغیر | الزامی | توضیح |
|-------|--------|-------|
| `APP_ENV` | بله | `development` یا `production` — preset سرور |
| `NEXT_PUBLIC_APP_ENV` | بله | همان zone برای client bundle (باید با `APP_ENV` یکی باشد) |
| `API_SERVICE_MODE` | بله | `mock` یا `api` |
| `UI_DEV_MODE` | خیر | با مقدار `1` در development، API محلی ثابت و عبور خودکار از auth برای توسعه UI |
| `NEXT_PUBLIC_UI_DEV_MODE` | خیر | همان فلگ برای مرورگر — جلوگیری از ریدایرکت به پنل خارجی |
| `AUTH_SECRET` | بله | حداقل ۳۲ کاراکتر |
| `APP_PORT` | خیر | پورت host در Docker (پیش‌فرض `3000`) |
| `ENABLE_DEV_ADMIN_LOGIN` | خیر | فقط برای login جعلی در غیر-production |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | خیر | bypass super admin (مستقیم در کد؛ در Zod نیست) |

### Overrideهای اختیاری

فقط وقتی preset کافی نیست:

```env
BACKEND_API_BASE_URL=
SSO_CHECK_TOKEN_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PANEL_BASE_URL=
NEXT_PUBLIC_PANEL_LOGIN_URL=
NEXT_PUBLIC_PANEL_PROFILE_URL=
NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=
```

---

## API service mode

| مقدار | رفتار |
|-------|--------|
| `mock` | BFF handlers + fixtures در حافظه |
| `api` | proxy تمام `/api/v2/*` به backend خارجی |

برای توسعه کامل UI بدون دسترسی به backend این فلگ‌ها را فعال کنید:

```env
UI_DEV_MODE=1
NEXT_PUBLIC_UI_DEV_MODE=1
```

در این حالت مقدار `API_SERVICE_MODE` نادیده گرفته می‌شود، تمام درخواست‌ها داخل BFF به mockهای
ثابت پاسخ داده می‌شوند، SSO به پنل خارجی زده نمی‌شود، و route guardهای پنل و ادمین بدون login
قابل عبور هستند. این رفتار در `NODE_ENV=production` غیرفعال است.

---

## Docker و deploy

### Build-time vs runtime

- **Server vars** (`AUTH_SECRET`, `BACKEND_API_*`, …): runtime از `env_file: .env`
- **Client zone** (`NEXT_PUBLIC_APP_ENV`): در Docker production در **زمان build** bake می‌شود

بعد از تغییر `APP_ENV` / `NEXT_PUBLIC_APP_ENV` باید image را rebuild کنید:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

فقط restart کافی نیست.

### Compose

- `docker-compose.yml` — behind nginx network (legacy single stack)
- `docker-compose.prod.yml` — **production** on live host (`mlm_front_prod`, port `3000`, nibmarket DNS)
- `docker-compose.v2.yml` — **v2 / UI** on live host (`mlm_front_v2`, port `3001`, mocks + auth bypass)
- `docker-compose.dev.yml` — hot reload; `NEXT_PUBLIC_*` in runtime from `.env`

Live host env files (gitignored on server): `.env.production`, `.env.v2` (seeded from `*.example`).

### Continuous deploy (WireGuard)

The live host is only reachable over WireGuard. Cloud CI cannot SSH into it, so CD runs **on the server**:

- `scripts/server-cd.sh` — fetch `main`, rebuild both stacks when SHA changes
- `deploy/mlm-cd.timer` — every 2 minutes
- Version stamp: `NEXT_PUBLIC_GIT_SHA` → UI shows `0.1.0+<sha>`

After you push to Azure `main`, wait ~2 minutes or run `/opt/MLM_Front/scripts/server-cd.sh --force` on the host.

First-time setup (from a machine with WireGuard ON):

```bash
yarn bootstrap:live
```

Docker install uses Ubuntu `apt` (`docker.io` + `docker-compose-v2`) because `get.docker.com` often returns 403 from restricted networks.

### `deploy.sh`

- سرور پیش‌فرض: `pod1.nibdev.com` → معمولاً `APP_ENV=development`
- اگر `.env` روی سرور نباشد: از `.env.example` کپی می‌شود؛ با `DEPLOY_APP_ENV=production` از `.env.production.example`
- قبل از build مقدار `APP_ENV` را لاگ می‌کند

برای live nibmarket روی سرور:

```env
APP_ENV=production
NEXT_PUBLIC_APP_ENV=production
AUTH_SECRET=<strong-random-secret>
```

---

## استفاده در کد

```ts
// server components / route handlers:
import { serverEnv } from "@/config/env.server";
const mode = serverEnv.API_SERVICE_MODE;

// client components:
import { env } from "@/config/env";
const appName = env.APP_NAME;
const zone = env.APP_ENV;
```

## امنیت

- `AUTH_SECRET` و `SUPER_ADMIN_*` هرگز `NEXT_PUBLIC_` نمی‌گیرند
- production: secretهای تصادفی و طولانی استفاده کنید
- `env.server.ts` فقط در server context import شود
