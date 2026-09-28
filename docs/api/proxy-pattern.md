# BFF Proxy Pattern

## چرا BFF؟

| دلیل | توضیح |
|------|--------|
| **امنیت** | `DATABASE_URL` server-only است — browser هرگز آن را نمی‌بیند |
| **DB access متمرکز** | تمام queryهای Prisma در server handlers/repositories قرار دارند |
| **Session resolution** | سرور از `nib_token` signed cookie کاربر جاری را resolve می‌کند و با `nib_refresh` refresh می‌کند |
| **Custom handlers** | منطق domain API در `route-registry.ts` ثبت می‌شود |

---

## جریان درخواست

```
Browser
  └─ fetch("/api/v2/dashboard/wallet")
       │
       ▼
src/app/api/v2/[...path]/route.ts
       │
       ├─ resolveHandler(method, path)
       │    ├─ MATCH  → handler → repository → Prisma → Postgres
       │    └─ NO MATCH → 404 JSON
       ▼
  Response به Browser
```

---

## فایل‌های کلیدی

| فایل | مسئولیت |
|------|---------|
| `src/app/api/v2/[...path]/route.ts` | catch-all handler — GET/POST/PUT/PATCH/DELETE |
| `src/lib/api/server/route-registry.ts` | نگاشت `METHOD:path` به custom handler |
| `src/lib/api/server/proxy-handler.ts` | 404 برای مسیر بدون handler |
| `src/lib/api/server/session.ts` | cookie/session helpers |
| `src/lib/api/server/handlers/*.handler.ts` | domain handlers |
| `src/lib/db/prisma.ts` | PrismaClient singleton |
| `src/lib/db/repositories/*.repository.ts` | queryهای Prisma |

---

## Session Extraction

`session.ts` به این ترتیب token را می‌خواند:

```ts
const userId = getCurrentUserId(req);
```

Client هرگز مستقیم DB یا token را مدیریت نمی‌کند — سرور از کوکی httpOnly می‌خواند.

`nib_token` یک access token امضاشده HMAC-SHA256 با claimهای `sub`، `role`، `mobile`، `referralCode`، `type`، `iat` و `exp` است. اگر API با `401` پاسخ بدهد، `apiClient` یک بار `POST /api/v2/auth/refresh` را با `nib_refresh` صدا می‌زند و در صورت موفقیت همان request را retry می‌کند.

---

## اضافه کردن Custom Handler

```ts
// 1. handler را بنویسید
// src/lib/api/server/handlers/my-feature.handler.ts
export async function myHandler(req: Request): Promise<Response> {
  // منطق خاص
  return NextResponse.json({ ok: true });
}

// 2. در route-registry.ts ثبت کنید
// src/lib/api/server/route-registry.ts
const CUSTOM_ROUTES = {
  "POST:/auth/login":  loginHandler,
  "POST:/auth/logout": logoutHandler,
  "POST:/my-feature":  myHandler,   // ← اضافه کنید
};
```

تمام endpointهای فعال باید در `route-registry.ts` ثبت شوند.

---

## اضافه کردن Handler

```ts
// 1. repository بسازید
// src/lib/db/repositories/my-feature.repository.ts
export async function getMyFeatureData(userId: string) {
  // Prisma query
}

// 2. handler بسازید
// src/lib/api/server/handlers/my-feature.handler.ts
import type { MyFeatureData } from "@/types/mlm";

export async function myFeatureHandler(req: Request): Promise<Response> {
  return NextResponse.json(await getMyFeatureData(userId));
}
```

---

## اضافه کردن Feature کامل

برای اضافه کردن یک feature جدید (مثل `wallet`):

```
1. src/lib/db/repositories/wallet.repository.ts ← Prisma queries
2. src/lib/api/server/handlers/wallet.handler.ts← BFF handler
3. src/lib/api/server/route-registry.ts         ← ثبت مسیر
4. src/lib/api/endpoints.ts                     ← اضافه کردن به ENDPOINTS
5. src/types/mlm.ts                             ← DTO جدید
6. src/types/mappers.ts                         ← Prisma row → DTO
7. src/features/wallet/service.ts               ← WalletService با apiClient
8. src/features/wallet/queries.ts               ← useWallet() با useQuery
9. src/resources/messages/fa/wallet.json        ← رشته‌های UI
10. src/resources/messages/fa/index.ts          ← export رشته‌ها
```

---

## Handler vs Repository

| | Handler | Repository |
|--|---------|------------|
| **موقعیت** | `server/handlers/` | `lib/db/repositories/` |
| **کاربرد** | HTTP/session/response | Prisma query و aggregate |
| **ثبت در** | `route-registry.ts` | import در handler |

---

## Environment

```env
# server-only (.env.local)
DATABASE_URL=postgresql://nibclub_user:nibclub_dev_pass@localhost:5432/nibclub
AUTH_SECRET=dev_only_auth_secret_for_nibclub_please_change
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000

# client (NEXT_PUBLIC_*)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
