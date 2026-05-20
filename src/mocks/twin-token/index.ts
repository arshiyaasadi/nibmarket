import type { TwinPriceChartResponse, TwinTokenStatsResponse } from 'src/types/api/twin-token'

export const mockTwinTokenStats: TwinTokenStatsResponse = {
  poolBalance: 45000000000,
  totalTokens: 1000000000,
  circulatingTokens: 950000000,
  tokenPrice: 47.37,
  priceChange24h: 2.45,
  burnedTokens: 50000000
}

const baseTime = new Date('2026-05-19T12:00:00').getTime()
const hourMs = 60 * 60 * 1000
const ohlcSeries: [number, number, number, number][] = [
  [47.2, 47.8, 47.0, 47.5],
  [47.5, 47.9, 47.3, 47.6],
  [47.6, 48.0, 47.4, 47.8],
  [47.8, 48.2, 47.6, 47.4],
  [47.4, 47.7, 47.1, 47.3],
  [47.3, 47.6, 47.0, 47.5],
  [47.5, 48.1, 47.2, 48.0],
  [48.0, 48.4, 47.8, 48.2],
  [48.2, 48.5, 47.9, 48.0],
  [48.0, 48.3, 47.6, 47.7],
  [47.7, 48.0, 47.4, 47.6],
  [47.6, 47.9, 47.3, 47.4],
  [47.4, 47.8, 47.2, 47.5],
  [47.5, 47.9, 47.3, 47.7],
  [47.7, 48.1, 47.5, 48.0],
  [48.0, 48.4, 47.8, 48.3],
  [48.3, 48.6, 48.0, 48.1],
  [48.1, 48.4, 47.8, 47.9],
  [47.9, 48.2, 47.6, 47.5],
  [47.5, 47.8, 47.2, 47.4],
  [47.4, 47.7, 47.1, 47.3],
  [47.3, 47.6, 47.0, 47.2],
  [47.2, 47.5, 46.9, 47.37],
  [47.37, 47.6, 47.1, 47.37]
]

export const mockTwinPriceChart: TwinPriceChartResponse = {
  currentPrice: 47.37,
  priceChange24h: 2.45,
  candles: ohlcSeries.map((y, i) => ({
    x: baseTime - (23 - i) * hourMs,
    y
  }))
}
