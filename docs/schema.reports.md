# API Schema — بخش گزارش (`/reports/*`, `/capital-deposit`)

> **Base URL:** `https://api-club.nibdev.com` (`NEXT_PUBLIC_API_BASE_URL`)  
> **منو:** «گزارش» در [`src/navigation/vertical/index.ts`](../src/navigation/vertical/index.ts)  
> **Mock:** [`src/mocks/reports/index.ts`](../src/mocks/reports/index.ts)  
> **راهنما:** [`docs/DATA_SOURCE.md`](./DATA_SOURCE.md)

---

## فهرست

| slug | صفحه | Method | Endpoint | Query |
|------|------|--------|----------|-------|
| `reports-income` | `/reports/income` | GET | `/api/reports/income` | `year`, `month` |
| `reports-subsets` | `/reports/subsets` | GET | `/api/reports/subsets` | `year`, `month` |
| `reports-wallet` | `/reports/wallet` | GET | `/api/reports/wallet` | `startDate`, `endDate`, `type` |
| `reports-capital-deposit` | `/capital-deposit` | GET | `/api/reports/capital-deposit` | — |

---

## reports-income

```ts
type IncomeTransactionType = 'فعالیت در سامانه' | 'توسعه شبکه' | 'پورسانت'

type IncomeTransaction = {
  id: string
  date: string
  type: IncomeTransactionType
  description: string
}

type ReportsIncomeResponse = { rows: IncomeTransaction[] }
```

---

## reports-subsets

```ts
type SubsetReportRow = {
  id: string
  rowNumber: number
  fullName: string
  joinDate: string
  level: number
  lastMonthAvgInvestment: number
  lastMonthReward: number
  currentMonthAvgInvestment: number
  totalReward: number
}

type ReportsSubsetsResponse = { rows: SubsetReportRow[] }
```

---

## reports-wallet

```ts
type WalletTransactionType = 'واریز' | 'برداشت'

type WalletTransaction = {
  id: string
  date: string
  type: WalletTransactionType
  description: string
}

type ReportsWalletResponse = { rows: WalletTransaction[] }
```

Query `type`: `all` | `deposit` | `withdraw` (mapper: واریز/برداشت)

---

## reports-capital-deposit

```ts
type CapitalDepositFund = {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

type ReportsCapitalDepositResponse = {
  funds: CapitalDepositFund[]
  statistics: {
    totalInvestors: number
    totalCapital: number
    firstInvestorsCapital: number
    networkCapital: number
  }
}
```

---

## Mapper

- `unwrapPayload({ data })`
- `rows` / `entries` / `items` نرمال
- fallback: [`src/mocks/reports`](../src/mocks/reports/index.ts)
