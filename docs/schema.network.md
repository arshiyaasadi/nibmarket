# API Schema — بخش شبکه من (`/network/*`)

> **Base URL:** `https://api-club.nibdev.com` (env: `NEXT_PUBLIC_API_BASE_URL`)  
> **منوی UI:** «شبکه من» در [`src/navigation/vertical/index.ts`](../src/navigation/vertical/index.ts)  
> **منبع mock فعلی:** داده‌های inline در صفحات `src/app/network/*` → متمرکز در [`src/mocks/network/index.ts`](../src/mocks/network/index.ts)  
> **راهنمای env:** [`docs/DATA_SOURCE.md`](./DATA_SOURCE.md)

---

## فهرست بخش‌ها

| # | slug | صفحه | Method | Endpoint پیشنهادی |
|---|------|------|--------|---------------------|
| 1 | `network-subsets` | `/network/my-subsets` | GET | `/api/network/subsets` |
| 2 | `network-subset-tree` | `/network/subset-tree` | GET | `/api/network/subset-tree` |
| 3 | `network-invite` | `/network/invite-friends` | GET | `/api/network/invite` |
| 4 | `network-referrer` | `/network/my-referrer` | GET | `/api/network/referrer` |
| — | — | `/network/my-referrer` | POST | `/api/network/referrer` |
| — | — | `/network/invite-friends` | POST | `/api/network/invite` |

> **تفاوت با داشبورد:** `GET /api/dashboard/invites` فقط خلاصه ویجت داشبورد است. صفحه `invite-friends` داده کامل‌تر (صندوق‌ها، سهمیه، ویزارد) دارد.

---

## 1. network-subsets — زیرمجموعه‌های من (جدول)

**صفحه:** [`src/app/network/my-subsets/page.tsx`](../src/app/network/my-subsets/page.tsx)  
**Endpoint:** `GET /api/network/subsets`

### Schema

```ts
type NetworkSubsetRow = {
  id: number
  fullName: string
  level: number
  joinDate: string          // شمسی، e.g. "1402/08/15"
  subMembersCount: number
  leaderboardRank: number
  avatar: string            // URL مسیر آواتار
}

type NetworkSubsetsResponse = {
  rows: NetworkSubsetRow[]
}
```

### Mock (UI فعلی)

```json
{
  "rows": [
    { "id": 1, "fullName": "علی احمدی", "level": 5, "joinDate": "1402/08/15", "subMembersCount": 12, "leaderboardRank": 3, "avatar": "/images/avatars/1.png" },
    { "id": 2, "fullName": "سارا محمدی", "level": 7, "joinDate": "1402/07/20", "subMembersCount": 25, "leaderboardRank": 1, "avatar": "/images/avatars/2.png" }
  ]
}
```

منبع کامل: `src/mocks/network/index.ts` (۸ ردیف)

---

## 2. network-subset-tree — درخت زیرمجموعه

**صفحه:** [`src/app/network/subset-tree/page.tsx`](../src/app/network/subset-tree/page.tsx)  
**Endpoint:** `GET /api/network/subset-tree`

### Schema

```ts
type NetworkTreeNode = {
  id: string
  name: string
  family: string
  balance: number | string    // UI: تومان — e.g. 5000000
  networks: NetworkTreeNode[] // فرزندان (کلید API می‌تواند `children` باشد — mapper نرمال می‌کند)
}

type NetworkSubsetTreeResponse = {
  root: NetworkTreeNode
}
```

### Mock (ریشه درخت UI)

```json
{
  "root": {
    "id": "1",
    "name": "علی",
    "family": "احمدی",
    "balance": 5000000,
    "networks": [
      {
        "id": "2",
        "name": "محمد",
        "family": "رضایی",
        "balance": 3000000,
        "networks": []
      }
    ]
  }
}
```

---

## 3. network-invite — دعوت از دوستان (بارگذاری صفحه)

**صفحه:** [`src/app/network/invite-friends/page.tsx`](../src/app/network/invite-friends/page.tsx)  
**Endpoint:** `GET /api/network/invite`

### Schema

```ts
type NetworkFund = {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

type NetworkRecentInvite = {
  id: number
  name: string
  date: string              // برچسب نسبی، e.g. "2 روز پیش"
  avatar: string
}

type NetworkInvitePageResponse = {
  referralCode: string
  maxInvitesPerMonth: number
  remainingInvites: number
  funds: NetworkFund[]
  recentInvites: NetworkRecentInvite[]
}
```

### Mock

```json
{
  "referralCode": "INVITE2024",
  "maxInvitesPerMonth": 15,
  "remainingInvites": 15,
  "funds": [{ "id": "1", "name": "نهال سرمایه ایرانیان", "symbol": "صنهال", "category": "درآمد ثابت | ETF", "investors": 0, "capital": 0, "percentage": 0 }],
  "recentInvites": [
    { "id": 1, "name": "علی احمدی", "date": "2 روز پیش", "avatar": "/images/avatars/1.png" }
  ]
}
```

### POST — ارسال دعوت

**Endpoint:** `POST /api/network/invite`

```ts
type SendNetworkInviteRequest = {
  inviteeName: string
  inviteeMobile: string
  messageTemplate?: string
  fundId?: string
}

type SendNetworkInviteResponse = {
  success: boolean
  remainingInvites: number
  referralLink?: string
}
```

---

## 4. network-referrer — معرف من

**صفحه:** [`src/app/network/my-referrer/page.tsx`](../src/app/network/my-referrer/page.tsx)  
**Endpoint:** `GET /api/network/referrer`

### Schema

```ts
type NetworkReferrerInfo = {
  firstName: string
  lastName: string
  usedDate: string          // e.g. "۱۴۰۳/۰۹/۱۵"
}

type NetworkReferrerResponse = {
  hasSubsets: boolean       // اگر true، ثبت کد معرف غیرفعال
  referrer: NetworkReferrerInfo | null
}
```

### Mock (وضعیت اولیه — بدون معرف ثبت‌شده)

```json
{
  "hasSubsets": false,
  "referrer": null
}
```

### POST — ثبت کد معرف

**Endpoint:** `POST /api/network/referrer`

```ts
type SubmitReferrerRequest = {
  referralCode: string
}

type SubmitReferrerResponse = {
  success: boolean
  referrer: NetworkReferrerInfo
}
```

Mock پس از submit موفق: `{ firstName: "محمد", lastName: "رضایی", usedDate: "۱۴۰۳/۰۹/۱۵" }`

---

## env و slug

همان `NEXT_PUBLIC_DATA_SOURCE` و `NEXT_PUBLIC_API_ENABLED` داشبورد — slugهای `network-*` در کنار `dashboard-*`.

| env | رفتار |
|-----|--------|
| `DATA_SOURCE=mock` | `src/mocks/network` |
| `DATA_SOURCE=api` + slug فعال | `src/api/network/*` → mapper → UI |
| خطای API | overlay فارسی + «تلاش مجدد» per بخش (مثل داشبورد) |

---

## فایل‌های پیاده‌سازی فرانت

| نقش | مسیر |
|-----|------|
| Types | `src/types/api/network.ts` |
| Mock | `src/mocks/network/index.ts` |
| API | `src/api/network/*.ts` |
| Mapper | `src/lib/network/mappers.ts` |
| Hooks | `src/hooks/network/*.ts` |
| Mutations | `src/api/network/mutations.ts` |
| Config | `src/configs/data-source.ts` |
