/** Pure calc helpers for landing share estimator (no DOM). */

export const COIN_PRICE_TOMAN = 523;

export const CALC_PRESETS = [
  { n1: 5, avg: 105, avgLabel: "۱۰ میلیون تومان" },
  { n1: 15, avg: 300, avgLabel: "۳۰۰ میلیون تومان" },
  { n1: 30, avg: 10000, avgLabel: "۱۰ میلیارد" },
] as const;

const AVG_MIN = 10;
const AVG_SPAN = 1000;

export function avgFromSlider(v: number): number {
  const n = AVG_MIN * Math.pow(AVG_SPAN, v / 1000);
  if (n < 100) return Math.round(n);
  if (n < 1000) return Math.round(n / 5) * 5;
  return Math.round(n / 50) * 50;
}

export function sliderFromAvg(a: number): number {
  return Math.round((1000 * Math.log(a / AVG_MIN)) / Math.log(AVG_SPAN));
}

export function computeShare(avgMillion: number, n1: number, n2: number, n3: number) {
  const avgM = Math.max(10, avgMillion || 0);
  const a = avgM * 1e6;
  const N1 = Math.max(0, n1 || 0);
  const N2 = Math.max(0, n2 || 0);
  const N3 = Math.max(0, n3 || 0);
  const yr = a * (N1 * 0.012 + N2 * 0.004 + N3 * 0.002);
  return {
    monthlyToman: yr / 12,
    monthlyCoins: yr / 12 / COIN_PRICE_TOMAN,
    dailyCoins: yr / 365 / COIN_PRICE_TOMAN,
  };
}

export function faNum(n: number): string {
  return Math.round(n).toLocaleString("fa-IR");
}

export function mobileToEn(s: string): string {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[^\d]/g, "");
}

export function isValidIranMobile(s: string): boolean {
  return /^09\d{9}$/.test(mobileToEn(s));
}
