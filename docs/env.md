# Environment Variables

## فایل‌های env

| فایل | کاربرد |
|------|--------|
| `.env.example` | مرجع canonical — همه فیلدها با مقادیر dev |
| `.env` | fallback مشترک (gitignored در برخی setupها) |
| `.env.local` | override محلی — اولویت بالاتر در Next.js |

هر سه فایل **همان فیلدها** را دارند. فقط `.env.local` را برای تغییرات شخصی ویرایش کنید.

## فایل‌های config (Zod validation)

| فایل | جایگاه | محتوا |
|------|---------|-------|
| `src/config/env.server.ts` | server-only | `API_SERVICE_MODE`، auth، backend URLs |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | برای استفاده در components |

## فهرست کامل متغیرها

### Server-only

```env
API_SERVICE_MODE=api
BACKEND_API_BASE_URL=https://api-club.nibdev.com
BACKEND_API_VERSION=v2
AUTH_SECRET=dev_only_auth_secret_for_nibclub_please_change
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000
SSO_CHECK_TOKEN_URL=https://panel.nibdev.com/api/v1/auth/check_token
SUPER_ADMIN_EMAIL=superadmin@nibclub.ir
SUPER_ADMIN_PASSWORD=NibAdmin@1403
```

| متغیر | الزامی | توضیح |
|-------|--------|-------|
| `API_SERVICE_MODE` | بله | `mock` یا `api` |
| `BACKEND_API_BASE_URL` | بله (در حالت api) | base URL backend |
| `BACKEND_API_VERSION` | بله (در حالت api) | پیش‌فرض `v2` |
| `BACKEND_API_URL` | خیر | deprecated — full URL |
| `AUTH_SECRET` | بله | حداقل ۳۲ کاراکتر |
| `ACCESS_TOKEN_TTL_SECONDS` | خیر | پیش‌فرض `900` |
| `REFRESH_TOKEN_TTL_SECONDS` | خیر | پیش‌فرض `2592000` |
| `SSO_CHECK_TOKEN_URL` | خیر | endpoint `check_token` خارجی |
| `SUPER_ADMIN_EMAIL` | خیر | bypass لاگین super admin |
| `SUPER_ADMIN_PASSWORD` | خیر | رمز super admin |

### Client (`NEXT_PUBLIC_*`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=https://club.nibdev.com
NEXT_PUBLIC_APP_NAME=Nib Club
NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
NEXT_PUBLIC_PANEL_LOGIN_URL=
NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
NEXT_PUBLIC_PANEL_PROFILE_URL=https://panel.nibdev.com/profile/
NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=https://panel.nibdev.com/user-account/
```

## API service mode

| مقدار | رفتار |
|-------|--------|
| `mock` | BFF handlers + fixtures در حافظه |
| `api` | proxy تمام `/api/v2/*` به backend خارجی |

## استفاده در کد

```ts
// server components / route handlers:
import { serverEnv } from "@/config/env.server";
const mode = serverEnv.API_SERVICE_MODE;

// client components:
import { env } from "@/config/env";
const appName = env.APP_NAME;
```

## امنیت

- `AUTH_SECRET` و `SUPER_ADMIN_*` هرگز `NEXT_PUBLIC_` نمی‌گیرند
- production: secretهای تصادفی و طولانی استفاده کنید
- `env.server.ts` فقط در server context import شود
