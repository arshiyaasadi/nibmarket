/**
 * Compact Jalali ↔ Gregorian helpers for schedule pickers.
 * Algorithms adapted from common public-domain jalaali conversions.
 */

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function mod(a: number, b: number) {
  return a - Math.trunc(a / b) * b;
}

/** Gregorian → Jalali [jy, jm, jd] */
export function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    gdm[gm - 1];
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

/** Jalali → Gregorian [gy, gm, gd] */
export function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    div(jy, 33) * 8 +
    div(mod(jy, 33) + 3, 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) gd -= salA[gm];
  return [gy, gm, gd];
}

export function jalaliPartsFromDate(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const [year, month, day] = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    year,
    month,
    day,
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/** Build a local Date from Jalali parts, then return ISO UTC string. */
export function jalaliPartsToIsoUtc(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}): string {
  const [gy, gm, gd] = toGregorian(parts.year, parts.month, parts.day);
  const local = new Date(gy, gm - 1, gd, parts.hour, parts.minute, 0, 0);
  return local.toISOString();
}

export function isJalaliLeapYear(year: number): boolean {
  return ((((year - 474) % 2820) + 474 + 38) * 682) % 2816 < 682;
}

export function daysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;
