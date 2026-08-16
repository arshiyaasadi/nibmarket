import type { AdminUserGeoPoint, AdminUserGeoResponse } from "@/types/admin";

/**
 * City anchors with a member weight and a scatter radius in degrees.
 * Tehran is intentionally dense to mirror the real member distribution.
 */
const CITY_SEEDS = [
  { city: "تهران", province: "تهران", lat: 35.6892, lng: 51.389, count: 420, spread: 0.22 },
  { city: "کرج", province: "البرز", lat: 35.8355, lng: 50.9915, count: 70, spread: 0.12 },
  { city: "اسلامشهر", province: "تهران", lat: 35.5522, lng: 51.235, count: 46, spread: 0.08 },
  { city: "ورامین", province: "تهران", lat: 35.3242, lng: 51.6456, count: 32, spread: 0.08 },
  { city: "شهریار", province: "تهران", lat: 35.6597, lng: 51.0578, count: 30, spread: 0.08 },
  { city: "مشهد", province: "خراسان رضوی", lat: 36.2605, lng: 59.6168, count: 78, spread: 0.14 },
  { city: "اصفهان", province: "اصفهان", lat: 32.6546, lng: 51.668, count: 66, spread: 0.14 },
  { city: "شیراز", province: "فارس", lat: 29.5918, lng: 52.5837, count: 54, spread: 0.13 },
  { city: "تبریز", province: "آذربایجان شرقی", lat: 38.0962, lng: 46.2738, count: 48, spread: 0.12 },
  { city: "اهواز", province: "خوزستان", lat: 31.3183, lng: 48.6706, count: 36, spread: 0.12 },
  { city: "قم", province: "قم", lat: 34.6416, lng: 50.8746, count: 30, spread: 0.1 },
  { city: "کرمانشاه", province: "کرمانشاه", lat: 34.3142, lng: 47.065, count: 24, spread: 0.1 },
  { city: "رشت", province: "گیلان", lat: 37.2808, lng: 49.5832, count: 24, spread: 0.1 },
  { city: "ارومیه", province: "آذربایجان غربی", lat: 37.5527, lng: 45.0761, count: 20, spread: 0.1 },
  { city: "زاهدان", province: "سیستان و بلوچستان", lat: 29.4963, lng: 60.8629, count: 16, spread: 0.1 },
  { city: "کرمان", province: "کرمان", lat: 30.2839, lng: 57.0834, count: 18, spread: 0.1 },
  { city: "یزد", province: "یزد", lat: 31.8974, lng: 54.3569, count: 16, spread: 0.1 },
  { city: "بندرعباس", province: "هرمزگان", lat: 27.1865, lng: 56.2808, count: 15, spread: 0.1 },
  { city: "اردبیل", province: "اردبیل", lat: 38.2498, lng: 48.2933, count: 12, spread: 0.09 },
  { city: "همدان", province: "همدان", lat: 34.7992, lng: 48.5146, count: 12, spread: 0.09 },
  { city: "ساری", province: "مازندران", lat: 36.5633, lng: 53.06, count: 12, spread: 0.09 },
  { city: "گرگان", province: "گلستان", lat: 36.8427, lng: 54.4436, count: 10, spread: 0.09 },
  { city: "بوشهر", province: "بوشهر", lat: 28.9234, lng: 50.82, count: 10, spread: 0.09 },
  { city: "خرم‌آباد", province: "لرستان", lat: 33.4878, lng: 48.3558, count: 9, spread: 0.09 },
  { city: "سنندج", province: "کردستان", lat: 35.3219, lng: 46.9862, count: 9, spread: 0.09 },
  { city: "بیرجند", province: "خراسان جنوبی", lat: 32.8663, lng: 59.2211, count: 7, spread: 0.09 },
  { city: "ایلام", province: "ایلام", lat: 33.6374, lng: 46.4227, count: 6, spread: 0.09 },
  { city: "شهرکرد", province: "چهارمحال و بختیاری", lat: 32.3256, lng: 50.8644, count: 6, spread: 0.09 },
  { city: "سمنان", province: "سمنان", lat: 35.5769, lng: 53.3958, count: 6, spread: 0.09 },
  { city: "زنجان", province: "زنجان", lat: 36.6736, lng: 48.4787, count: 7, spread: 0.09 },
  { city: "قزوین", province: "قزوین", lat: 36.2688, lng: 50.0041, count: 8, spread: 0.09 },
  { city: "یاسوج", province: "کهگیلویه و بویراحمد", lat: 30.6682, lng: 51.5878, count: 5, spread: 0.08 },
  { city: "بجنورد", province: "خراسان شمالی", lat: 37.4747, lng: 57.329, count: 5, spread: 0.08 },
  { city: "چابهار", province: "سیستان و بلوچستان", lat: 25.2919, lng: 60.643, count: 4, spread: 0.08 },
  { city: "کیش", province: "هرمزگان", lat: 26.5578, lng: 53.9807, count: 4, spread: 0.05 },
] as const;

const FIRST_NAMES = [
  "علی",
  "زهرا",
  "محمد",
  "فاطمه",
  "رضا",
  "مریم",
  "حسین",
  "سارا",
  "امیر",
  "نگار",
  "مهدی",
  "الهام",
  "سعید",
  "شیما",
  "کیوان",
  "پریسا",
] as const;

const LAST_NAMES = [
  "محمدی",
  "احمدی",
  "حسینی",
  "کریمی",
  "رضایی",
  "موسوی",
  "جعفری",
  "نوری",
  "صادقی",
  "اکبری",
  "قاسمی",
  "شریفی",
  "زارع",
  "بابایی",
  "یوسفی",
  "امینی",
] as const;

const STATUSES = ["active", "active", "active", "pending_verification", "suspended"] as const;

/** Deterministic pseudo-random in [-1, 1] so the map is stable between reloads. */
function jitter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function buildMobile(seed: number): string {
  const suffix = String(Math.floor(Math.abs(jitter(seed * 3.7)) * 100_000_000)).padStart(8, "0");
  return `09${String(10 + (seed % 90))}${suffix}`.slice(0, 11);
}

function buildPoints(): AdminUserGeoPoint[] {
  const points: AdminUserGeoPoint[] = [];
  let seed = 1;

  for (const city of CITY_SEEDS) {
    for (let index = 0; index < city.count; index += 1) {
      seed += 1;
      const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(seed * 7) % LAST_NAMES.length];

      points.push({
        id: `geo-${seed}`,
        fullName: `${firstName} ${lastName}`,
        mobile: buildMobile(seed),
        city: city.city,
        province: city.province,
        lat: city.lat + jitter(seed) * city.spread,
        lng: city.lng + jitter(seed + 0.5) * city.spread,
        status: STATUSES[seed % STATUSES.length],
      });
    }
  }

  return points;
}

const USER_GEO_POINTS = buildPoints();

export function getAdminUserGeoPoints(): AdminUserGeoResponse {
  return { points: USER_GEO_POINTS, total: USER_GEO_POINTS.length };
}
