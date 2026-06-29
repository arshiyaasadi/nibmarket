# Environment Variables

## فایل‌های config

| فایل | جایگاه | محتوا |
|------|---------|-------|
| `src/config/env.server.ts` | server-only | `DATABASE_URL` برای Prisma و `AUTH_SECRET` برای tokenهای signed |
| `src/config/env.client.ts` | client + server | `NEXT_PUBLIC_*` |
| `src/config/env.ts` | client-safe re-export | برای استفاده در components |

## متغیرها

### Server-only (بدون NEXT_PUBLIC_)

```env
DATABASE_URL=postgresql://nibclub_user:YOUR_DB_PASSWORD_HERE@localhost:5432/nibclub
AUTH_SECRET=change_me_please_use_32_chars_minimum_for_dev
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000
SSO_CHECK_TOKEN_URL=https://panel.nibdev.com/api/v1/auth/check_token
# ⚠️ هرگز NEXT_PUBLIC_ نگیرد — فقط Prisma server-side استفاده می‌کند
```

### Client (NEXT_PUBLIC_)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nib Club
NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
NEXT_PUBLIC_PANEL_LOGIN_URL=
NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
NEXT_PUBLIC_PANEL_PROFILE_URL=
NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=
```

## نمونه .env.local (توسعه)

```env
# Server-only
DATABASE_URL=postgresql://nibclub_user:nibclub_dev_pass@localhost:5432/nibclub
AUTH_SECRET=dev_only_auth_secret_for_nibclub_please_change
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000

# Client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nib Club
NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
NEXT_PUBLIC_PANEL_LOGIN_URL=
NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
```

## نمونه .env.production

```env
DATABASE_URL=postgresql://nibclub_user:CHANGE_ME@postgres:5432/nibclub
AUTH_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000

NEXT_PUBLIC_SITE_URL=https://club.nibdev.com
NEXT_PUBLIC_APP_URL=https://club.nibdev.com
NEXT_PUBLIC_APP_NAME=Nib Club
NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
NEXT_PUBLIC_PANEL_LOGIN_URL=
NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
NEXT_PUBLIC_PANEL_PROFILE_URL=https://panel.nibdev.com/profile/
NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=https://panel.nibdev.com/user-account/
```

## Validation با Zod

هر دو فایل env با Zod validate می‌شوند — اگر متغیری اشتباه باشد، app هنگام startup crash می‌کند:

```ts
// env.server.ts
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.string().transform(Number),
  REFRESH_TOKEN_TTL_SECONDS: z.string().transform(Number),
});
```

## استفاده در کد

```ts
// در server components / route handlers / server actions:
import { serverEnv } from "@/config/env.server";
const url = serverEnv.DATABASE_URL;
const secret = serverEnv.AUTH_SECRET;

// در client components / هر جای دیگر:
import { env } from "@/config/env";
const appName = env.APP_NAME;
```

## امنیت

- `DATABASE_URL` هرگز `NEXT_PUBLIC_` نمی‌گیرد
- `AUTH_SECRET` فقط server-side است و tokenهای `nib_token`/`nib_refresh` را امضا می‌کند
- مقدار local dev فقط برای توسعه است؛ production باید secret طولانی و تصادفی داشته باشد
- `env.server.ts` فقط در server context import می‌شود
- اگر اشتباهاً در client import شود، Next.js خطا می‌دهد

## Authentication / SSO setup

SSO نیب مارکت از پنل خارجی شروع می‌شود، اما exchange توکن در BFF داخلی انجام می‌شود تا کلاینت مستقیم به API خارجی نرود.

```mermaid
flowchart LR
  LoginButton[LoginWithNibMarket] --> PanelLogin[PanelLogin]
  PanelLogin --> Callback[LoginSsoCallback]
  Callback --> BffExchange["BFF auth/sso/exchange"]
  BffExchange --> CheckToken[ExternalCheckToken]
  BffExchange --> InternalSession[InternalHttpOnlyCookies]
  InternalSession --> Dashboard[Dashboard]
```

| متغیر | نوع | توضیح |
|------|-----|-------|
| `NEXT_PUBLIC_APP_URL` | public | origin همین app برای ساخت callbackUrl |
| `NEXT_PUBLIC_SSO_CALLBACK_PATH` | public | مسیر callback، پیش‌فرض `/login/sso` |
| `NEXT_PUBLIC_PANEL_BASE_URL` | public | مقصد اصلی دکمه ورود با نیب مارکت؛ app فقط `callbackUrl` را به همین URL اضافه می‌کند |
| `NEXT_PUBLIC_PANEL_LOGIN_URL` | public optional | override کامل آدرس ورود پنل |
| `NEXT_PUBLIC_SSO_ENTRY_COOKIE` | public | نام cookie توکن entry، پیش‌فرض `nib_auth` |
| `NEXT_PUBLIC_PANEL_PROFILE_URL` | public optional | لینک پروفایل پنل |
| `NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL` | public optional | لینک حساب کاربری پنل |
| `SSO_CHECK_TOKEN_URL` | server-only | endpoint خارجی `check_token` که فقط BFF صدا می‌زند |

تست دستی:

1. بدون session روی `/login` کلیک «ورود با نیب مارکت» را بزنید؛ باید به `NEXT_PUBLIC_PANEL_BASE_URL` با `callbackUrl` درست redirect شود.
2. بعد از redirect پنل به `/login/sso`، فقط یک درخواست `POST /api/v1/auth/sso/exchange` باید زده شود.
3. در موفقیت، `nib_token`، `nib_refresh` و `nib_role` توسط BFF ست می‌شوند و کاربر به `returnUrl` یا `/dashboard` می‌رود.
4. `/login/sso` بدون cookie/token باید خطا و دکمه retry نشان دهد.
5. `/login/token` فقط fallback دستی است و باید JWT خام، `Bearer ...` یا URL حاوی `token` را بپذیرد.
6. اگر API خارجی CORS یا auth header لازم دارد، باید در سرویس خارجی تنظیم شود؛ frontend فقط خطا را نمایش می‌دهد.
