# منبع داده: Mock، Fake-DB و API واقعی

این سند نحوه کار **دو لایه mock** و **API بک‌اند** را در پروژه Nibmarket توضیح می‌دهد.

| سند | محتوا |
|-----|--------|
| [DATA_SOURCE.md](./DATA_SOURCE.md) (همین فایل) | env، fake-db، mock داشبورد/شبکه، توکن |
| [schema.md](./schema.md) | قرارداد endpointها و TypeScript types داشبورد |
| [schema.network.md](./schema.network.md) | قرارداد بخش «شبکه من» (`/network/*`) |
| [schema.reports.md](./schema.reports.md) | گزارشات (`/reports/*`, `/capital-deposit`) |
| [schema.leaderboard.md](./schema.leaderboard.md) | لیدر بورد (`/leaderboard/*`) |
| [schema.twin-token.md](./schema.twin-token.md) | توکن TWIN مدیر (`/manager/twin-token`) |

---

## خلاصه سه منبع داده

```mermaid
flowchart LR
  subgraph dashboard [Dashboard /dashboard]
    MD[src/mocks/dashboard]
    API[api-club.nibdev.com]
  end
  subgraph network [Network /network]
    MN[src/mocks/network]
  end
  subgraph reports [Reports / Leaderboard / Twin]
    MR[src/mocks/reports]
    ML[src/mocks/leaderboard]
    MT[src/mocks/twin-token]
  end
  subgraph rest [بقیه اپ — login، تمپلیت، ...]
    FDB[src/@fake-db axios-mock]
  end
  ENV[NEXT_PUBLIC_DATA_SOURCE]
  ENV -->|mock| MD
  ENV -->|mock| MN
  ENV -->|mock| MR
  ENV -->|mock| ML
  ENV -->|mock| MT
  ENV -->|api + slug enabled| API
  ENV -->|api slug disabled| MD
  ENV -->|api slug disabled| MN
  ENV -->|api slug disabled| MR
  ENV -->|api slug disabled| ML
  ENV -->|api slug disabled| MT
  FDB --> rest
```

| لایه | مسیر | چه زمانی |
|------|------|----------|
| **Mock داشبورد** | `src/mocks/dashboard/` | `DATA_SOURCE=mock` یا slug در `API_ENABLED` نیست یا API خطا داد |
| **Mock شبکه** | `src/mocks/network/` | همان منطق برای slugهای `network-*` |
| **Mock گزارش / لیدربورد / TWIN** | `src/mocks/reports/`، `leaderboard/`، `twin-token/` | slugهای `reports-*`، `leaderboard-*`، `manager-twin-*` |
| **API واقعی** | `src/api/dashboard/`، `network/`، `reports/`، `leaderboard/`، `manager/twin-token/` | `DATA_SOURCE=api` و slug در `API_ENABLED` |
| **Fake-DB** | `src/@fake-db/` | همیشه در `providers.tsx` لود می‌شود؛ login، invoice، email، منو و ... |

Fake-DB با **axios-mock-adapter** روی همان `axios` پیش‌فرض تمپلیت کار می‌کند و به env داشبورد وابسته نیست.

---

## متغیرهای محیطی

فایل‌ها: [`.env`](../.env) (لوکال)، [`.env.example`](../.env.example) (نمونه commit‌شده)، **`.env.local`** (توکن واقعی — commit نکنید).

| متغیر | پیش‌فرض | توضیح |
|--------|---------|--------|
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | `mock` = داشبورد فقط از mock محلی. `api` = ترکیب API + mock تدریجی |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api-club.nibdev.com` | Base URL برای `apiClient` (مسیرها به‌صورت خودکار با `/v1` پیشوند می‌شوند، مثلاً `/v1/api/dashboard/wallet`) |
| `NEXT_PUBLIC_API_ENABLED` | خالی در حالت `api` | **خالی یا `all`** = همه slugها (داشبورد + شبکه + گزارش + لیدربورد + TWIN)؛ یا لیست با کاما |
| `NEXT_PUBLIC_USER_TOKEN` | خالی | `Bearer ...` برای dev وقتی کاربر لاگین نکرده |
| `NEXT_PUBLIC_JWT_*` | — | فقط **fake-db auth** (لاگین mock تمپلیت) |

### slugهای `NEXT_PUBLIC_API_ENABLED`

| slug | Endpoint |
|------|----------|
| `dashboard-rewards` | `GET /api/dashboard/rewards` |
| `dashboard-wallet` | `GET /api/dashboard/wallet` |
| `dashboard-invites` | `GET /api/dashboard/invites` |
| `dashboard-leaderboard` | `GET /api/dashboard/leaderboard?period=` |
| `dashboard-chart-monthly-rewards` | `GET /api/dashboard/charts/monthly-rewards` |
| `dashboard-chart-daily-growth` | `GET /api/dashboard/charts/daily-subordinate-growth` |
| `dashboard-chart-monthly-rewards-alt` | `GET /api/dashboard/charts/monthly-rewards-trend` |

جزئیات schema در [schema.md](./schema.md)، [schema.network.md](./schema.network.md)، [schema.reports.md](./schema.reports.md)، [schema.leaderboard.md](./schema.leaderboard.md)، [schema.twin-token.md](./schema.twin-token.md).

### slugهای شبکه (`network-*`)

| slug | Endpoint |
|------|----------|
| `network-subsets` | `GET /api/network/subsets` |
| `network-subset-tree` | `GET /api/network/subset-tree` |
| `network-invite` | `GET /api/network/invite` |
| `network-referrer` | `GET /api/network/referrer` |

POST: `POST /api/network/referrer`، `POST /api/network/invite` — از [`useNetworkMutations.ts`](../src/hooks/network/useNetworkMutations.ts).

### slugهای گزارش (`reports-*`)

| slug | Endpoint |
|------|----------|
| `reports-income` | `GET /api/reports/income?year=&month=` |
| `reports-subsets` | `GET /api/reports/subsets?year=&month=` |
| `reports-wallet` | `GET /api/reports/wallet?startDate=&endDate=&type=` |
| `reports-capital-deposit` | `GET /api/reports/capital-deposit` |

### slugهای لیدر بورد (`leaderboard-*`)

| slug | Endpoint |
|------|----------|
| `leaderboard-pool-balance` | `GET /api/leaderboard/pool-balance` |
| `leaderboard-current-month` | `GET /api/leaderboard/current-month` |
| `leaderboard-my-subsets` | `GET /api/leaderboard/my-subsets` |
| `leaderboard-last-month` | `GET /api/leaderboard/last-month` |
| `leaderboard-honors` | `GET /api/leaderboard/honors` |
| `leaderboard-missions` | `GET /api/leaderboard/missions` |

### slugهای توکن TWIN (`manager-twin-*`)

| slug | Endpoint |
|------|----------|
| `manager-twin-stats` | `GET /api/manager/twin-token/stats` |
| `manager-twin-price-chart` | `GET /api/manager/twin-token/price-history` |

---

## سناریوهای استفاده

### ۱. توسعه UI فقط (پیش‌فرض)

```env
NEXT_PUBLIC_DATA_SOURCE=mock
```

- داشبورد: `src/mocks/dashboard`
- لاگین و صفحات تمپلیت: `@fake-db`
- نیازی به بک‌اند زنده نیست

### ۲. همه endpointهای داشبورد از API

```env
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_BASE_URL=https://api-club.nibdev.com
NEXT_PUBLIC_API_ENABLED=
```

`API_ENABLED` خالی (یا `all`) = هر ویجت داشبورد و بخش شبکه درخواست می‌زند.

### ۲ب. اتصال تدریجی (فقط بعضی ویجت‌ها)

```env
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_ENABLED=dashboard-wallet,dashboard-rewards
```

- فقط ویجت‌های لیست‌شده از API می‌خوانند
- بقیه ویجت‌ها همان mock محلی
- اگر API خطا بدهد (404، شبکه، 5xx): **فقط همان کارت** به mock برمی‌گردد + Alert «تلاش مجدد»

### ۳. تست بدون لاگین (توکن dev)

```env
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_ENABLED=dashboard-wallet
NEXT_PUBLIC_USER_TOKEN=Bearer eyJ...
```

**اولویت توکن** (`src/lib/auth-token.ts`):

1. `localStorage.accessToken` — بعد از لاگین mock/real
2. Cookie `accessToken`
3. `NEXT_PUBLIC_USER_TOKEN` — در بوت با `ApiBootstrap` در cookie ذخیره می‌شود

توکن را در **`.env.local`** بگذارید، نه در git.

### ۴. بعد از `npm run dev`

تغییر `NEXT_PUBLIC_*` نیاز به **ری‌استارت dev server** دارد (مقادیر در build-time embed می‌شوند).

---

## Fake-DB چیست و چه کاری نمی‌کند

**مسیر:** `src/@fake-db/` — در [`src/app/providers.tsx`](../src/app/providers.tsx) با `import 'src/@fake-db'` همیشه لود می‌شود.

| پوشش می‌دهد | پوشش نمی‌دهد |
|-------------|----------------|
| `/jwt/login`, `/auth/me` | `/api/dashboard/*` |
| invoice، email، calendar، FAQ، ... | کیف پول واقعی TWIN |
| منوی vertical/horizontal | لیدربورد داشبورد کلاینت |

`mock.onAny().passThrough()` در [`src/@fake-db/mock.ts`](../src/@fake-db/mock.ts) یعنی URLهای تعریف‌نشده (مثل dashboard API) از mock عبور می‌کنند — در حالت `api` آن‌ها توسط **`apiClient`** جداگانه با `baseURL` بک‌اند صدا زده می‌شوند، نه fake-db.

---

## معماری فرانت (داشبورد + شبکه)

```
src/configs/data-source.ts   → isApiMode(), shouldUseApiForEndpoint(slug)
src/hooks/useApiResource.ts  → loading / retrying / hasData / refetch
src/api/dashboard/*.ts       → fetchers داشبورد
src/api/network/*.ts         → fetchers شبکه
src/hooks/dashboard/*.ts     → useDashboard*
src/hooks/network/*.ts       → useNetwork*
src/mocks/dashboard/index.ts
src/mocks/network/index.ts
src/app/network/*/page.tsx   → صفحات شبکه من
```

هر ویجت/بخش مستقل است: خطای یک endpoint روی بقیه اثر ندارد.

---

## خطا، لودینگ و «تلاش مجدد» (هر ویجت)

| حالت | UI در کارت |
|------|------------|
| `loading` | Skeleton |
| API موفق | داده / نمودار |
| API fail (شبکه، 4xx، 5xx، map نامعتبر) | **فقط** Alert + دکمه «تلاش مجدد» — بدون mock و بدون نمودار |
| `DATA_SOURCE=mock` | mock محلی، بدون Alert خطا |

- **Retry:** فقط همان endpoint همان ویجت دوباره fetch می‌شود (`refetch` در hook).
- **صفحه نمی‌ریزد:** `DashboardWidgetErrorBoundary` + عدم رندر `children` هنگام خطا.
- **رنگ API:** مقادیری مثل `"76, 78, 100"` در `safeThemeColor` / mapper به `primary` و … تبدیل می‌شوند تا MUI crash نکند.

فایل‌های کلیدی: [`DashboardWidgetState.tsx`](../src/components/dashboard/DashboardWidgetState.tsx)، [`useApiResource.ts`](../src/hooks/dashboard/useApiResource.ts).

---

## عیب‌یابی

| علامت | احتمال |
|--------|--------|
| همیشه mock | `DATA_SOURCE=mock` یا (در `api`) slug در لیست جزئی `API_ENABLED` نیست |
| Alert بدون نمودار | API خطا — فقط همان ویجت؛ retry را بزنید |
| کرش رنگ `76, 78, 100` | API `color` نامعتبر بود؛ باید با mapper اصلاح شود (اگر دیدید، dev server را restart کنید) |
| 401 از API | توکن منقضی یا `NEXT_PUBLIC_USER_TOKEN` / لاگین را چک کنید |
| CORS | بک‌اند باید origin فرانت را allow کند |
| تغییر env اعمال نشد | dev server را restart کنید |

**Health بک‌اند (جدا از داشبورد):** [`/health/`](../src/app/health/page.tsx) و `BACKEND_HEALTH_URL` — server-side probe.

---

## چک‌لیست برای ایجنت / توسعه‌دهنده

- [ ] `.env` از `.env.example` سینک است
- [ ] توکن واقعی فقط در `.env.local`
- [ ] endpoint جدید: schema در `docs/schema.md` + fetcher در `src/api/dashboard/` + hook + slug در `API_ENABLED`
- [ ] صفحات غیر داشبورد هنوز fake-db/mock صفحه‌ای دارند — در این فاز جداگانه مستند شده در schema
