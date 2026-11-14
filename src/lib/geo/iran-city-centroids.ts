/** Approximate city / province-capital centroids for density map pins. */
export interface IranCityCentroid {
  city: string;
  province: string;
  lat: number;
  lng: number;
  /** Scatter radius in degrees for deterministic jitter. */
  spread: number;
}

export const IRAN_CITY_CENTROIDS: readonly IranCityCentroid[] = [
  { city: "تهران", province: "تهران", lat: 35.6892, lng: 51.389, spread: 0.18 },
  { city: "کرج", province: "البرز", lat: 35.8355, lng: 50.9915, spread: 0.1 },
  { city: "اسلامشهر", province: "تهران", lat: 35.5522, lng: 51.235, spread: 0.06 },
  { city: "ورامین", province: "تهران", lat: 35.3242, lng: 51.6456, spread: 0.06 },
  { city: "شهریار", province: "تهران", lat: 35.6597, lng: 51.0578, spread: 0.06 },
  { city: "مشهد", province: "خراسان رضوی", lat: 36.2605, lng: 59.6168, spread: 0.12 },
  { city: "اصفهان", province: "اصفهان", lat: 32.6546, lng: 51.668, spread: 0.12 },
  { city: "شیراز", province: "فارس", lat: 29.5918, lng: 52.5837, spread: 0.11 },
  { city: "تبریز", province: "آذربایجان شرقی", lat: 38.0962, lng: 46.2738, spread: 0.1 },
  { city: "اهواز", province: "خوزستان", lat: 31.3183, lng: 48.6706, spread: 0.1 },
  { city: "قم", province: "قم", lat: 34.6416, lng: 50.8746, spread: 0.08 },
  { city: "کرمانشاه", province: "کرمانشاه", lat: 34.3142, lng: 47.065, spread: 0.08 },
  { city: "رشت", province: "گیلان", lat: 37.2808, lng: 49.5832, spread: 0.08 },
  { city: "ارومیه", province: "آذربایجان غربی", lat: 37.5527, lng: 45.0761, spread: 0.08 },
  { city: "زاهدان", province: "سیستان و بلوچستان", lat: 29.4963, lng: 60.8629, spread: 0.08 },
  { city: "کرمان", province: "کرمان", lat: 30.2839, lng: 57.0834, spread: 0.08 },
  { city: "یزد", province: "یزد", lat: 31.8974, lng: 54.3569, spread: 0.08 },
  { city: "بندرعباس", province: "هرمزگان", lat: 27.1865, lng: 56.2808, spread: 0.08 },
  { city: "اردبیل", province: "اردبیل", lat: 38.2498, lng: 48.2933, spread: 0.07 },
  { city: "همدان", province: "همدان", lat: 34.7992, lng: 48.5146, spread: 0.07 },
  { city: "ساری", province: "مازندران", lat: 36.5633, lng: 53.06, spread: 0.07 },
  { city: "آمل", province: "مازندران", lat: 36.4697, lng: 52.3507, spread: 0.06 },
  { city: "گرگان", province: "گلستان", lat: 36.8427, lng: 54.4436, spread: 0.07 },
  { city: "بوشهر", province: "بوشهر", lat: 28.9234, lng: 50.82, spread: 0.07 },
  { city: "خرم‌آباد", province: "لرستان", lat: 33.4878, lng: 48.3558, spread: 0.07 },
  { city: "سنندج", province: "کردستان", lat: 35.3219, lng: 46.9862, spread: 0.07 },
  { city: "بیرجند", province: "خراسان جنوبی", lat: 32.8663, lng: 59.2211, spread: 0.07 },
  { city: "ایلام", province: "ایلام", lat: 33.6374, lng: 46.4227, spread: 0.07 },
  { city: "شهرکرد", province: "چهارمحال و بختیاری", lat: 32.3256, lng: 50.8644, spread: 0.07 },
  { city: "سمنان", province: "سمنان", lat: 35.5769, lng: 53.3958, spread: 0.07 },
  { city: "زنجان", province: "زنجان", lat: 36.6736, lng: 48.4787, spread: 0.07 },
  { city: "قزوین", province: "قزوین", lat: 36.2688, lng: 50.0041, spread: 0.07 },
  { city: "یاسوج", province: "کهگیلویه و بویراحمد", lat: 30.6682, lng: 51.5878, spread: 0.06 },
  { city: "بجنورد", province: "خراسان شمالی", lat: 37.4747, lng: 57.329, spread: 0.06 },
  { city: "چابهار", province: "سیستان و بلوچستان", lat: 25.2919, lng: 60.643, spread: 0.06 },
  { city: "کیش", province: "هرمزگان", lat: 26.5578, lng: 53.9807, spread: 0.04 },
  { city: "اراک", province: "مرکزی", lat: 34.0917, lng: 49.6892, spread: 0.07 },
  { city: "طبس", province: "یزد", lat: 33.5959, lng: 56.9244, spread: 0.06 },
] as const;

const BY_CITY = new Map(IRAN_CITY_CENTROIDS.map((item) => [item.city, item]));

/** First centroid for a province (usually the capital). */
const BY_PROVINCE = new Map<string, IranCityCentroid>();
for (const item of IRAN_CITY_CENTROIDS) {
  if (!BY_PROVINCE.has(item.province)) BY_PROVINCE.set(item.province, item);
}

export function centroidForCity(city: string): IranCityCentroid | undefined {
  return BY_CITY.get(city);
}

export function centroidForProvince(province: string): IranCityCentroid | undefined {
  return BY_PROVINCE.get(province);
}
