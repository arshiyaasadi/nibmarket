# API Rules

## اصل‌های اساسی

- همه `fetch` به `/api/v1/*` باشد — هرگز مستقیم به backend
- `DATABASE_URL` هرگز `NEXT_PUBLIC_` نگیرد (server-only secret)
- Token از `nib_token` cookie خوانده می‌شود — client دستی ارسال نمی‌کند
- Feature services فقط از `apiClient` استفاده کنند — نه `fetch` مستقیم

## ساختار

```
features/{feature}/service.ts   ← apiClient calls
features/{feature}/queries.ts   ← useQuery / useMutation hooks
lib/api/endpoints.ts            ← ENDPOINTS constant (تمام path‌ها اینجا)
lib/db/repositories/            ← Prisma queries
lib/api/server/route-registry.ts← custom handlers (auth، domain APIs)
```

## Endpoint ها

همه path‌ها در `ENDPOINTS` تعریف می‌شوند — هرگز رشته hardcode:

```ts
// ✅ درست
apiClient.get(ENDPOINTS.DASHBOARD.WALLET)

// ❌ اشتباه
apiClient.get("/dashboard/wallet")
```

## اضافه کردن Feature API

1. type جدید در `src/types/mlm.ts`
2. endpoint در `src/lib/api/endpoints.ts`
3. repository در `src/lib/db/repositories/feature.repository.ts`
4. handler در `src/lib/api/server/handlers/feature.handler.ts`
5. ثبت handler در `src/lib/api/server/route-registry.ts`
6. service در `src/features/{feature}/service.ts`
7. queries در `src/features/{feature}/queries.ts`

## Custom Handler (auth، transform)

```ts
// src/lib/api/server/route-registry.ts
const CUSTOM_ROUTES = {
  "POST:/auth/login":  loginHandler,
  "POST:/auth/logout": logoutHandler,
  // handler جدید اینجا
};
```

همه endpointهای فعال باید handler داشته باشند. مسیر بدون handler باید 404 بدهد.

## خطاها

- `apiClient` در صورت `res.ok === false` پرتاب `ApiException` می‌کند
- `error-handler.ts` در صورت 401 → clearAuth() (auto-logout)
- از `handleApiError()` در mutation's `onError` استفاده کنید
