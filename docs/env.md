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

- `docker-compose.yml` — پشت شبکه nginx
- `docker-compose.prod.yml` — port mapping (پیش‌فرض `deploy.sh`)
- `docker-compose.dev.yml` — hot reload؛ `NEXT_PUBLIC_*` در runtime از `.env`

هر دو فایل prod فقط `APP_ENV` را به‌عنوان build arg می‌فرستند؛ URLها از preset داخل کد می‌آیند.

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
