import type { TokenPricePoint } from "@/types/mlm";

/** Approximate Twin price in Rial for mock chart data. */
const BASE_PRICE = 24_500;

/** Deterministic daily variation — stable across server restarts. */
function dailyDelta(dayIndex: number): number {
  return (
    Math.sin(dayIndex * 0.42) * 180 +
    Math.cos(dayIndex * 0.19) * 110 +
    Math.sin(dayIndex * 0.08) * 60
  );
}

export function getTokenPriceHistory(days = 7): TokenPricePoint[] {
  const points: TokenPricePoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let price = BASE_PRICE - dailyDelta(0) * (days / 2);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    if (i < days - 1) {
      price += dailyDelta(days - 1 - i);
      price = Math.max(18_000, Math.min(34_000, price));
    }

    points.push({
      date: date.toISOString().slice(0, 10),
      price: Number(price.toFixed(0)),
    });
  }

  return points;
}
