import { ensureArray, toNumber } from 'src/lib/dashboard/normalize'
import { mockTwinPriceChart, mockTwinTokenStats } from 'src/mocks/twin-token'
import type { TwinPriceCandle, TwinPriceChartResponse, TwinTokenStatsResponse } from 'src/types/api/twin-token'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

export function mapTwinTokenStats(raw: unknown): TwinTokenStatsResponse {
  const fallback = mockTwinTokenStats
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>

  return {
    poolBalance: toNumber(o.poolBalance, fallback.poolBalance),
    totalTokens: toNumber(o.totalTokens, fallback.totalTokens),
    circulatingTokens: toNumber(o.circulatingTokens, fallback.circulatingTokens),
    tokenPrice: toNumber(o.tokenPrice ?? o.price, fallback.tokenPrice),
    priceChange24h: toNumber(o.priceChange24h ?? o.change24h, fallback.priceChange24h),
    burnedTokens: toNumber(o.burnedTokens, fallback.burnedTokens)
  }
}

function mapCandle(item: Record<string, unknown>, index: number, fallback: TwinPriceCandle): TwinPriceCandle {
  const rawY = item.y ?? item.ohlc
  let y = fallback.y
  if (Array.isArray(rawY) && rawY.length >= 4) {
    y = [toNumber(rawY[0], y[0]), toNumber(rawY[1], y[1]), toNumber(rawY[2], y[2]), toNumber(rawY[3], y[3])]
  }

  return {
    x: toNumber(item.x ?? item.timestamp, fallback.x),
    y
  }
}

export function mapTwinPriceChart(raw: unknown): TwinPriceChartResponse {
  const fallback = mockTwinPriceChart
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawCandles = ensureArray<Record<string, unknown>>(o.candles ?? o.data ?? o.series)
  const candles =
    rawCandles.length > 0
      ? rawCandles.map((item, i) => mapCandle(item, i, fallback.candles[i] ?? fallback.candles[0]))
      : fallback.candles

  return {
    candles,
    currentPrice: toNumber(o.currentPrice ?? o.tokenPrice, fallback.currentPrice),
    priceChange24h: toNumber(o.priceChange24h ?? o.change24h, fallback.priceChange24h)
  }
}
