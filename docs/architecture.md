# Nib Club Panel — Architecture

## Stack

| ابزار | نسخه | کاربرد |
|-------|------|---------|
| Next.js | 16.2.9 | App Router، BFF proxy، SSR |
| React | 19.2.4 | رندر UI |
| TypeScript | 5 | strict mode |
| Zustand | 5 | client state (auth، ui) |
| TanStack Query | 5 | server state (fetch، cache) |
| next-intl | 4 | i18n فارسی (`localePrefix: "never"`) |
| Tailwind | 4 | استایل‌بندی با `@theme` CSS variables |
| Zod | 4 | validation متغیرهای محیطی |
| Prisma | 7 | server-side ORM برای BFF route handlers |

---

## لایه‌بندی

```
┌────────────────────────────────────────────────────────┐
│  App Pages  (app/(panel)/ · (auth)/ · (admin)/)        │
│  UI Atoms   (components/ui/atoms/)                      │
├────────────────────────────────────────────────────────┤
│  features/*/queries.ts  (React Query hooks)             │
│  features/*/service.ts  (apiClient calls)               │
│  store/slices/          (Zustand — auth + ui)           │
├────────────────────────────────────────────────────────┤
│  apiClient  →  /api/v1/*  (BFF — Next.js Route Handler) │
├────────────────────────────────────────────────────────┤
│  route-registry → handlers → repositories → Prisma      │
│  PrismaClient → PostgreSQL (`shared/database/schema.sql`)│
└────────────────────────────────────────────────────────┘
```

**اصل کلیدی:** client هرگز مستقیم به backend نمی‌رسد. تمام traffic از `/api/v1` عبور می‌کند.
Prisma فقط در server route handlers استفاده می‌شود و migration/seed همچنان از لایه SQL-first ریشه پروژه انجام می‌شود.

---

## ساختار پوشه‌ها

```
src/
├── app/
│   ├── (panel)/              ← صفحات پنل کاربر (client)
│   │   ├── dashboard/
│   │   ├── network/{subsets,tree,invite,referrer}/
│   │   ├── reports/{wallet,subsets,income}/
│   │   ├── leaderboard/{pool,missions}/
│   │   ├── competition/{participate,prizes,records}/
│   │   ├── capital/
│   │   ├── notifications/
│   │   ├── rules/
│   │   ├── support/
│   │   └── layout.tsx        ← layout مشترک پنل (sidebar + header)
│   ├── (admin)/              ← صفحات ادمین (manager + admin only)
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── (auth)/
│   │   └── login/            ← فرم لاگین
│   ├── api/v1/[...path]/     ← BFF catch-all proxy
│   │   └── route.ts
│   ├── layout.tsx            ← root layout (AppProviders + next-intl)
│   └── page.tsx              ← redirect به /dashboard
│
├── components/
│   ├── errors/               ← ErrorBoundary، ErrorFallback
│   └── ui/
│       └── atoms/            ← 24 atom component (Design System)
│
├── config/
│   ├── env.ts                ← re-export از env.client (safe برای client)
│   ├── env.server.ts         ← DATABASE_URL (server-only)
│   ├── env.client.ts         ← NEXT_PUBLIC_* با Zod validation
│   ├── routes.ts             ← ROUTES constant (type-safe paths)
│   ├── roles.ts              ← ROLE_GUARDS، numericToRole()، canAccess()
│   └── assets.ts             ← مسیر تصاویر و asset‌ها
│
├── features/
│   ├── dashboard/
│   │   ├── queries.ts        ← useDashboardWallet، useDashboardRewards، ...
│   │   └── service.ts        ← DashboardService.getWallet()، ...
│   ├── capital/              ← useCapitalFunds، CapitalService
│   ├── leaderboard/          ← useLeaderboardPool، LeaderboardService
│   ├── network/              ← useNetworkSubsets، useSendInvite، NetworkService
│   ├── notifications/        ← useNotifications، NotificationsService
│   └── reports/              ← useReportsWallet، ReportsService
│
├── hooks/
│   └── use-session.ts        ← ترکیب auth fields در یک hook
│
├── i18n/
│   ├── routing.ts            ← locales: ["fa"]، localePrefix: "never"
│   └── request.ts            ← getRequestConfig → import messages/fa
│
├── lib/
│   ├── api/
│   │   ├── client.ts         ← apiClient: get/post/put/patch/delete
│   │   ├── endpoints.ts      ← ENDPOINTS constant (single source of truth)
│   │   ├── server/
│   │   │   ├── proxy-handler.ts     ← 404 برای endpoint بدون handler
│   │   │   ├── route-registry.ts    ← CUSTOM_ROUTES، resolveHandler()
│   │   │   ├── session.ts           ← current user/session helpers
│   │   │   └── handlers/
│   │   │       ├── auth.handler.ts  ← loginHandler + logoutHandler
│   │   │       └── *.handler.ts     ← domain API handlers
│   ├── db/
│   │   ├── prisma.ts                ← PrismaClient singleton
│   │   └── repositories/            ← Prisma queries by domain
│   └── errors/
│       ├── api-error.ts      ← ApiException class
│       ├── error-handler.ts  ← handleApiError() + auto-logout on 401
│       └── logger.ts         ← logError()
│
├── providers/
│   └── AppProviders.tsx      ← QueryClient + NextIntlClientProvider
│
├── proxy.ts                  ← Next.js route guard (auth + RBAC)
│
├── resources/
│   ├── data/
│   │   ├── fund-labels.json  ← برچسب انواع صندوق
│   │   └── mission-codes.json← برچسب کدهای ماموریت
│   └── messages/fa/
│       ├── index.ts          ← merge تمام JSON‌ها
│       ├── common.json
│       ├── nav.json
│       ├── auth.json
│       ├── dashboard.json
│       ├── wallet.json
│       ├── missions.json
│       ├── network.json
│       ├── errors.json
│       └── pages.json        ← عناوین 16 صفحه پنل
│
├── store/
│   ├── slices/
│   │   ├── auth.slice.ts     ← token، role، userId، fullName + setAuth/clearAuth
│   │   └── ui.slice.ts       ← sidebarOpen، activeModal
│   ├── hooks/
│   │   ├── use-auth.ts       ← useIsAuthenticated، useUserRole، useAuthActions، useCanAccess
│   │   └── use-ui.ts         ← useSidebarOpen، useActiveModal، useUiActions
│   └── types/
│       └── store.types.ts    ← AuthSlice، UiSlice interfaces
│
├── styles/
│   └── globals.css           ← @import tailwindcss، @theme tokens، IRANSans
│
└── types/
    ├── mlm.ts                ← domain types (UserRole، User، Mission، Fund، ...)
    └── api.ts                ← ApiException، ApiError، ApiResult
```

---

## Auth Flow

```
1. کاربر     POST /api/v1/auth/login  {mobile, password}
2. Server    loginHandler (auth.handler.ts)
             ├── Mock:  NextResponse.json(MOCK_USER) + set httpOnly cookies
             └── Real:  backendFetch("/auth/login") → map role → set cookies
3. Client    دریافت {token, role, userId, fullName}
             → setAuth(Zustand) + router.refresh()
4. proxy.ts  درخواست‌های بعدی: nib_token + nib_role cookies → RBAC check
```

### کوکی‌های httpOnly

| کوکی | مقدار نمونه | تنظیمات |
|------|-------------|---------|
| `nib_token` | `"eyJ..."` | httpOnly، secure(prod)، sameSite=lax، 7 روز |
| `nib_role` | `"client"` | httpOnly، secure(prod)، sameSite=lax، 7 روز |

---

## نقش‌ها (RBAC)

```typescript
type UserRole = "client" | "manager" | "admin"
```

| عدد backend | نقش |
|-------------|-----|
| 0، 1 | `"client"` |
| 2 | `"manager"` |
| ≥ 3 | `"admin"` |

دسترسی‌ها در `config/roles.ts`:
- `ROLE_GUARDS` — `/dashboard`، `/network/*`، `/reports/*`، ...
- `ADMIN_ROLE_GUARDS` — `/admin`، `/admin/users`، `/admin/reports`
- `canAccess(path, role)` — در `proxy.ts` و `use-auth.ts` استفاده می‌شود

---

## Database Mode

```env
# .env.local
DATABASE_URL=postgresql://nibclub_user:nibclub_dev_pass@localhost:5432/nibclub
```

رفتار در حالت فعلی:
1. `apiClient` فقط `/api/v1/*` را صدا می‌زند.
2. `route-registry.ts` مسیر را به handler متناظر وصل می‌کند.
3. handler از repository استفاده می‌کند.
4. repository با Prisma از PostgreSQL می‌خواند.
5. مسیر بدون handler به‌صورت JSON 404 برمی‌گردد.

---

## Design System

| جنبه | جزئیات |
|------|---------|
| رنگ‌ها | `@theme` در `globals.css` — primary `#721bd9`، secondary `#4C4BAB` |
| فونت | IRANSans (300/400/700/900) از `public/fonts/IRANSans/` |
| RTL | CSS logical properties — `ps-*`، `pe-*`، `start-*`، `end-*` |
| Atoms | 24 component در `src/components/ui/atoms/` |
| Spacing | توکن‌های semantic در `tailwind.config.ts` — مستندات در `docs/spacing.md` |
| Icons | lucide-react با `optimizePackageImports` |

---

## قوانین اصلی

1. **No direct backend** — تمام `fetch` به `/api/v1/*`
2. **DATABASE_URL = server-only** — هرگز `NEXT_PUBLIC_` نمی‌گیرد
3. **No hardcoded strings** — فقط `t("key")` از next-intl
4. **State split**: server state = React Query، UI state = Zustand، local = useState
5. **Selector hooks** — `useIsAuthenticated()` نه `useAuthSlice().token`
6. **Prisma در server-only** — فقط handlers/repositories
7. **Query hooks در features/\*/queries.ts** — نه در store/hooks
8. **Spacing semantic** — فقط توکن‌های تعریف‌شده، نه `p-4`، `gap-6`
