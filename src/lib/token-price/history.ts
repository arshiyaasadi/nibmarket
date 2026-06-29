import type { TokenPricePoint } from "@/types/mlm";

const BASE_PRICE = 0.0245;

/** Deterministic daily variation — stable across server restarts. */
function dailyDelta(dayIndex: number): number {
  return (
    Math.sin(dayIndex * 0.42) * 0.0014 +
    Math.cos(dayIndex * 0.19) * 0.0009 +
    Math.sin(dayIndex * 0.08) * 0.0005
  );
}

export function getTokenPriceHistory(days = 30): TokenPricePoint[] {
  const points: TokenPricePoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let price = BASE_PRICE - dailyDelta(0) * (days / 2);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    if (i < days - 1) {
      price += dailyDelta(days - 1 - i);
      price = Math.max(0.018, Math.min(0.034, price));
    }

    points.push({
      date: date.toISOString().slice(0, 10),
      price: Number(price.toFixed(4)),
    });
  }

  return points;
}
