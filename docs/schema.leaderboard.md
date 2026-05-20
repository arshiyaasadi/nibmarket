# API Schema — لیدر بورد (`/leaderboard/*`)

> **Base URL:** `https://api-club.nibdev.com`  
> **Mock:** [`src/mocks/leaderboard/index.ts`](../src/mocks/leaderboard/index.ts)  
> **تفاوت داشبورد:** `dashboard-leaderboard` فقط ویجت CRM است؛ این سند صفحه کامل pool-board + missions.

---

## فهرست slug

| slug | ویجت | Endpoint |
|------|------|----------|
| `leaderboard-pool-balance` | `PoolBalance` | `GET /api/leaderboard/pool-balance` |
| `leaderboard-current-month` | `CurrentMonthLeaderboard` | `GET /api/leaderboard/current-month` |
| `leaderboard-my-subsets` | `MySubsetsLeaderboard` | `GET /api/leaderboard/my-subsets` |
| `leaderboard-last-month` | `LastMonthLeaderboard` | `GET /api/leaderboard/last-month` |
| `leaderboard-honors` | `HonorsShowcase` | `GET /api/leaderboard/honors` |
| `leaderboard-missions` | missions grid | `GET /api/leaderboard/missions` |

---

## Types

```ts
type PoolBalanceResponse = {
  poolBalance: number
  participantsCount: number
  monthlyChangePercent: number
}

type LeaderboardEntry = {
  id: number
  rank: number
  name: string
  points: number
  subordinates: number
  currentMonthRank?: number  // فقط my-subsets
}

type LeaderboardListResponse = { entries: LeaderboardEntry[] }

type HonorItem = {
  id: number
  title: string
  icon: string
  color: string
  description: string
  count: number
  totalPoints: number
}

type HonorsResponse = { honors: HonorItem[] }

type Mission = {
  id: number
  title: string
  completed: boolean
  reward: string
}

type MissionsResponse = { missions: Mission[] }
```

---

## Mapper

- fallback: [`src/mocks/leaderboard`](../src/mocks/leaderboard/index.ts)
- `entries` / `rows` / `leaderboard` برای لیست‌ها
