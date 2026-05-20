export type TwinTokenStatsResponse = {
  poolBalance: number
  totalTokens: number
  circulatingTokens: number
  tokenPrice: number
  priceChange24h: number
  burnedTokens: number
}

export type TwinPriceCandle = {
  x: number
  y: [number, number, number, number]
}

export type TwinPriceChartResponse = {
  candles: TwinPriceCandle[]
  currentPrice: number
  priceChange24h: number
}
