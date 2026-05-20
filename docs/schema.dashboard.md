# API Schema — داشبورد کلاینت (`/dashboard`)

> **Base URL:** `https://api-club.nibdev.com` (env: `NEXT_PUBLIC_API_BASE_URL`)  
> **صفحه UI:** `src/app/dashboard/page.tsx`  
> **منبع داده (mock / fake-db / API):** [`docs/DATA_SOURCE.md`](./DATA_SOURCE.md)  
> **Env:** [`.env.example`](../.env.example) · [`.env`](../.env)

---

## فهرست بخش‌ها

| # | نام (slug) | کامپوننت | Endpoint |
|---|------------|----------|----------|
| 1 | `dashboard-rewards` | `CrmRewards` | `GET /api/dashboard/rewards` |
| 2 | `dashboard-wallet` | `CrmTotalProfit` | `GET /api/dashboard/wallet` |
| 3 | `dashboard-invites` | `CrmAward` | `GET /api/dashboard/invites` |
| 4 | `dashboard-leaderboard` | `CrmProjectTimeline` | `GET /api/dashboard/leaderboard` |
| 5 | `dashboard-chart-monthly-rewards` | `CrmMonthlyRewardsLine` | `GET /api/dashboard/charts/monthly-rewards` |
| 6 | `dashboard-chart-daily-growth` | `CrmDailyGrowthLine` | `GET /api/dashboard/charts/daily-subordinate-growth` |
| 7 | `dashboard-chart-monthly-rewards-alt` | `CrmMonthlyRewardsBar` | `GET /api/dashboard/charts/monthly-rewards-trend` |

---

## 1. dashboard-rewards — پاداش‌ها و ماموریت‌ها

**کامپوننت:** `src/views/dashboards/crm/CrmRewards.tsx`  
**Endpoint:** `GET /api/dashboard/rewards`

### Schema

```ts
/** یکی از سه کارت خلاصه پاداش در بالای کارت */
type RewardSummaryItem = {
  title: string           // e.g. "کل پاداش بدست آمده"
  stats: string           // مقدار نمایشی (فعلاً "0")
  trendNumber: string     // e.g. "+0%"
  trend: 'positive' | 'negative'
  color: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary'
  icon: string            // نام آیکون iconify
}

type MissionStatus = 'completed' | 'pending'

type Mission = {
  id: number
  title: string
  completed: boolean
  reward: string          // e.g. "A توکن"
  status?: MissionStatus  // مشتق از completed: تکمیل شده | در انتظار
}

type DashboardRewardsResponse = {
  summaries: RewardSummaryItem[]
  missions: Mission[]
}
```

### Mock data (فعلی UI)

```json
{
  "summaries": [
    { "title": "کل پاداش بدست آمده", "stats": "0", "trendNumber": "+0%", "trend": "positive", "color": "primary", "icon": "mdi:trophy" },
    { "title": "پاداش این ماه", "stats": "0", "trendNumber": "+0%", "trend": "positive", "color": "success", "icon": "mdi:calendar-month" },
    { "title": "پاداش تجمیع شده استخر", "stats": "0", "trendNumber": "+0%", "trend": "positive", "color": "info", "icon": "mdi:water" }
  ],
  "missions": [
    { "id": 1, "title": "ثبت نام در سامانه", "completed": true, "reward": "A توکن" },
    { "id": 2, "title": "احراز هویت", "completed": false, "reward": "B توکن" },
    { "id": 3, "title": "معرفی هر فرد جدید", "completed": false, "reward": "C توکن" }
  ]
}
```

> منبع کامل ماموریت‌ها: `src/data/missions.ts` (۸ ماموریت؛ UI فقط ۳ تای اول را نشان می‌دهد)

---

## 2. dashboard-wallet — کیف پول TWIN

**کامپوننت:** `src/views/dashboards/crm/CrmTotalProfit.tsx`  
**Endpoint:** `GET /api/dashboard/wallet`

### Schema

```ts
type TwinWalletBalance = {
  totalBalance: number      // کل موجودی — UI: 68000
  withdrawableBalance: number // قابل برداشت — UI: 38000
  frozenBalance: number     // فریز — UI: 30000
  currency: 'TWIN'
}

type DashboardWalletResponse = TwinWalletBalance
```

### Mock data (فعلی UI)

```json
{
  "totalBalance": 68000,
  "withdrawableBalance": 38000,
  "frozenBalance": 30000,
  "currency": "TWIN"
}
```

### اکشن‌های مرتبط (بعداً)

| عمل | Endpoint پیشنهادی |
|-----|-------------------|
| انتقال / برداشت توکن | `POST /api/dashboard/wallet/withdraw` |
| مشاهده تراکنش‌ها | `GET /api/reports/wallet/transactions` (صفحه `/reports/wallet`) |

---

## 3. dashboard-invites — دعوت‌شدگان و کد معرف

**کامپوننت:** `src/views/dashboards/crm/CrmAward.tsx`  
**Endpoint:** `GET /api/dashboard/invites`

### Schema

```ts
type InvitedUserPreview = {
  id: number
  name: string
  invitedAtLabel: string  // متن نسبی مثل "2 روز پیش"
}

type DashboardInvitesResponse = {
  totalInvited: number
  referralCode: string
  recentInvites: InvitedUserPreview[]
}
```

### Mock data (فعلی UI)

```json
{
  "totalInvited": 24,
  "referralCode": "INVITE2024",
  "recentInvites": [
    { "id": 1, "name": "علی احمدی", "invitedAtLabel": "2 روز پیش" },
    { "id": 2, "name": "سارا محمدی", "invitedAtLabel": "5 روز پیش" },
    { "id": 3, "name": "رضا کریمی", "invitedAtLabel": "1 هفته پیش" }
  ]
}
```

### Query / لیست کامل (پیشنهادی)

`GET /api/dashboard/invites?page=1&limit=20` — برای «نمایش همه»

---

## 4. dashboard-leaderboard — لیدربورد

**کامپوننت:** `src/views/dashboards/crm/CrmProjectTimeline.tsx`  
**Endpoint:** `GET /api/dashboard/leaderboard`

### Schema

```ts
type LeaderboardPeriod = 'current' | 'previous'

type LeaderboardEntry = {
  rank: number
  name: string
  subordinates: number
  totalPoints: number
  growthData: number[]    // ۷ نقطه برای نمودار mini sparkline
}

type DashboardLeaderboardResponse = {
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
}
```

### Query params

| Param | نوع | توضیح |
|-------|-----|--------|
| `period` | `current` \| `previous` | فیلتر «ماه جاری» / «ماه گذشته» |

### Mock data (فعلی UI — `period=current`)

```json
{
  "period": "current",
  "entries": [
    { "rank": 1, "name": "علی احمدی", "subordinates": 45, "totalPoints": 12500, "growthData": [20, 35, 45, 30, 50, 60, 75] },
    { "rank": 2, "name": "محمد رضایی", "subordinates": 38, "totalPoints": 11200, "growthData": [15, 25, 30, 40, 35, 50, 65] },
    { "rank": 3, "name": "فاطمه کریمی", "subordinates": 32, "totalPoints": 9800, "growthData": [10, 20, 25, 30, 35, 40, 45] },
    { "rank": 4, "name": "حسن موسوی", "subordinates": 28, "totalPoints": 8750, "growthData": [5, 15, 20, 25, 30, 35, 40] },
    { "rank": 5, "name": "زهرا نوری", "subordinates": 25, "totalPoints": 8200, "growthData": [8, 12, 18, 22, 28, 32, 38] }
  ]
}
```

---

## 5. dashboard-chart-monthly-rewards — نمودار خطی پاداش ماهانه

**کامپوننت:** `src/views/dashboards/crm/CrmMonthlyRewardsLine.tsx`  
**Endpoint:** `GET /api/dashboard/charts/monthly-rewards`

### Schema

```ts
type PersianMonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type MonthlyRewardPoint = {
  month: PersianMonthIndex
  monthLabel: string      // فروردین … اسفند
  amount: number          // مقدار توکن
}

type MonthlyRewardsChartResponse = {
  seriesName: string      // "پاداش ماهانه"
  unit: 'TWIN' | 'token'
  points: MonthlyRewardPoint[]
}
```

### Mock data (فعلی UI — ۱۲ ماه)

```json
{
  "seriesName": "پاداش ماهانه",
  "unit": "token",
  "points": [
    { "month": 1, "monthLabel": "فروردین", "amount": 150 },
    { "month": 2, "monthLabel": "اردیبهشت", "amount": 200 },
    { "month": 3, "monthLabel": "خرداد", "amount": 180 },
    { "month": 4, "monthLabel": "تیر", "amount": 250 },
    { "month": 5, "monthLabel": "مرداد", "amount": 300 },
    { "month": 6, "monthLabel": "شهریور", "amount": 280 },
    { "month": 7, "monthLabel": "مهر", "amount": 350 },
    { "month": 8, "monthLabel": "آبان", "amount": 400 },
    { "month": 9, "monthLabel": "آذر", "amount": 380 },
    { "month": 10, "monthLabel": "دی", "amount": 450 },
    { "month": 11, "monthLabel": "بهمن", "amount": 420 },
    { "month": 12, "monthLabel": "اسفند", "amount": 500 }
  ]
}
```

---

## 6. dashboard-chart-daily-growth — رشد روزانه زیرمجموعه

**کامپوننت:** `src/views/dashboards/crm/CrmDailyGrowthLine.tsx`  
**Endpoint:** `GET /api/dashboard/charts/daily-subordinate-growth`

### Schema

```ts
type DailyGrowthPoint = {
  day: number             // 1..30
  dayLabel: string        // e.g. "روز 1"
  count: number
}

type DailySubordinateGrowthResponse = {
  hasData: boolean
  seriesName: string      // "رشد روزانه"
  points: DailyGrowthPoint[]
}
```

### Mock data (وقتی `hasData=true`)

```json
{
  "hasData": true,
  "seriesName": "رشد روزانه",
  "points": [
    { "day": 1, "dayLabel": "روز 1", "count": 5 },
    { "day": 2, "dayLabel": "روز 2", "count": 8 }
  ]
}
```

> آرایه کامل ۳۰ روز در UI: `[5, 8, 12, 15, 18, 22, 25, 28, 30, 35, 38, 42, 45, 48, 50, 55, 58, 60, 65, 68, 70, 75, 78, 80, 85, 88, 90, 95, 98, 100]`  
> **حالت خالی (فعلی پیش‌فرض):** `hasData: false` → UI: «اطلاعاتی هنوز ثبت نشده» + دکمه «به روزرسانی»

---

## 7. dashboard-chart-monthly-rewards-alt — نمودار روند پاداش (حالت خالی)

**کامپوننت:** `src/views/dashboards/crm/CrmMonthlyRewardsBar.tsx`  
**Endpoint:** `GET /api/dashboard/charts/monthly-rewards-trend`

### Schema

```ts
/** همان ساختار بخش ۵؛ نوع نمودار در UI متفاوت است (line بدون fill) */
type MonthlyRewardsTrendResponse = {
  hasData: boolean
  points: { month: number; amount: number }[]
}
```

### Mock data

همان اعداد بخش ۵: `[150, 200, 180, 250, 300, 280, 350, 400, 380, 450, 420, 500]`  
**حالت خالی (فعلی پیش‌فرض):** `hasData: false`

---

## نگاشت Layout → API (خلاصه)

```
/dashboard
├── CrmRewards          → GET /api/dashboard/rewards
├── CrmTotalProfit      → GET /api/dashboard/wallet
├── CrmAward            → GET /api/dashboard/invites
├── CrmProjectTimeline  → GET /api/dashboard/leaderboard?period=current|previous
├── CrmMonthlyRewardsLine     → GET /api/dashboard/charts/monthly-rewards
├── CrmDailyGrowthLine        → GET /api/dashboard/charts/daily-subordinate-growth
└── CrmMonthlyRewardsBar      → GET /api/dashboard/charts/monthly-rewards-trend
```

---