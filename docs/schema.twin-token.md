# API Schema — توکن TWIN (مدیر)

> **صفحه:** [`src/app/manager/twin-token/page.tsx`](../src/app/manager/twin-token/page.tsx)  
> **Mock:** [`src/mocks/twin-token/index.ts`](../src/mocks/twin-token/index.ts)

---

## فهرست

| slug | بخش | Method | Endpoint |
|------|-----|--------|----------|
| `manager-twin-stats` | `TwinTokenStatistics` | GET | `/api/manager/twin-token/stats` |
| `manager-twin-price-chart` | `TokenPriceChart` | GET | `/api/manager/twin-token/price-history` |

---

## manager-twin-stats

```ts
type TwinTokenStatsResponse = {
  poolBalance: number
  totalTokens: number
  circulatingTokens: number
  tokenPrice: number
  priceChange24h: number
  burnedTokens: number
}
```

---

## manager-twin-price-chart

```ts
type TwinPriceCandle = { x: number; y: [number, number, number, number] }

type TwinPriceChartResponse = {
  candles: TwinPriceCandle[]
  currentPrice: number
  priceChange24h: number
}
```

`y`: `[open, high, low, close]` برای Apex candlestick.

---

## Mapper

- fallback: [`src/mocks/twin-token`](../src/mocks/twin-token/index.ts)
