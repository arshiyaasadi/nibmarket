import type { AdminUserGeoLookupUser, AdminUserGeoPoint, AdminUserStatus } from "@/types/admin";
import { toEnglishDigits } from "@/lib/normalization/digits";
import {
  centroidForCity,
  centroidForProvince,
  type IranCityCentroid,
} from "@/lib/geo/iran-city-centroids";
import {
  lookupPostalRegion,
  UNKNOWN_POSTAL_REGION,
  type IranPostalRegion,
} from "@/lib/geo/iran-postal-ranges";

export interface IranPostalLocation extends IranPostalRegion {
  /** Normalized 10-digit Latin postal, or null when invalid. */
  postalCode: string | null;
  /** First 5 digits when valid. */
  routingPrefix: string | null;
  city: string;
  lat: number;
  lng: number;
}

const FALLBACK_CENTROID: IranCityCentroid = {
  city: "تهران",
  province: "تهران",
  lat: 32.4279,
  lng: 53.688,
  spread: 2.5,
};

/** Strip spaces/dashes and convert Persian/Arabic digits → Latin. */
export function normalizeIranPostalCode(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const digits = toEnglishDigits(String(value))
    .replace(/[\s\-–—]/g, "")
    .replace(/\D/g, "");
  if (!/^\d{10}$/.test(digits)) return null;
  if (/^(\d)\1{9}$/.test(digits)) return null;
  return digits;
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

/** Deterministic pseudo-random in [-1, 1] so pins stay stable across reloads. */
function jitter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function resolveCentroid(region: IranPostalRegion): IranCityCentroid {
  const byCity = centroidForCity(region.region);
  if (byCity) return byCity;

  const byProvince = centroidForProvince(region.province);
  if (byProvince) return byProvince;

  return FALLBACK_CENTROID;
}

/**
 * Approximate province/city/latlng from a 10-digit Iran postal code.
 * Uses 5-digit routing prefix ranges + city centroids with light jitter.
 */
export function decodeIranPostalCode(value: string | null | undefined): IranPostalLocation | null {
  const postalCode = normalizeIranPostalCode(value);
  if (!postalCode) return null;

  const prefix5 = Number(postalCode.slice(0, 5));
  const region = lookupPostalRegion(prefix5);
  const known = region.province !== UNKNOWN_POSTAL_REGION.province;
  const centroid = known ? resolveCentroid(region) : FALLBACK_CENTROID;
  const seed = hashSeed(postalCode);

  return {
    postalCode,
    routingPrefix: postalCode.slice(0, 5),
    province: known ? region.province : centroid.province,
    region: known ? region.region : centroid.city,
    city: known ? region.region : centroid.city,
    lat: centroid.lat + jitter(seed) * centroid.spread,
    lng: centroid.lng + jitter(seed + 0.5) * centroid.spread,
  };
}

export interface PostalGeoPointOptions {
  id?: string;
  fullName?: string;
  mobile?: string;
  status?: AdminUserStatus;
}

/** Build one density-map point from a postal string (anonymous cluster member). */
export function postalCodeToGeoPoint(
  postal: string,
  index: number,
  options: PostalGeoPointOptions = {},
): AdminUserGeoPoint | null {
  const location = decodeIranPostalCode(postal);
  if (!location?.postalCode) return null;

  return {
    id: options.id ?? `postal-${index}-${location.postalCode}`,
    fullName: options.fullName ?? location.city,
    mobile: options.mobile ?? location.postalCode,
    city: location.city,
    province: location.province,
    lat: location.lat,
    lng: location.lng,
    status: options.status ?? "active",
    postalCode: location.postalCode,
  };
}

/** Map API `postalCodes[]` → density points (skips invalid codes). */
export function postalCodesToGeoPoints(postalCodes: readonly string[]): AdminUserGeoPoint[] {
  const points: AdminUserGeoPoint[] = [];

  postalCodes.forEach((postal, index) => {
    const point = postalCodeToGeoPoint(postal, index);
    if (point) points.push(point);
  });

  return points;
}

/** Pin a lookup user using their postal code (falls back to Tehran centroid if missing). */
export function lookupUserToGeoPoint(user: AdminUserGeoLookupUser): AdminUserGeoPoint {
  const fromPostal = postalCodeToGeoPoint(user.postalCode ?? "", 0, {
    id: user.id,
    fullName: user.fullName,
    mobile: user.mobile,
    status: user.status,
  });

  if (fromPostal) return fromPostal;

  const fallback = FALLBACK_CENTROID;
  return {
    id: user.id,
    fullName: user.fullName,
    mobile: user.mobile,
    city: fallback.city,
    province: fallback.province,
    lat: fallback.lat,
    lng: fallback.lng,
    status: user.status,
    postalCode: user.postalCode,
  };
}
