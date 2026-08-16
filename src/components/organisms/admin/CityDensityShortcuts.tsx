/**
 * @level organism
 * Top three densest cities, each opening the density map pre-filtered to that city.
 */
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ChevronLeft, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { MAP_CITY_QUERY } from "@/config/map";
import { ROUTES } from "@/config/routes";
import type { AdminUserGeoResponse } from "@/types/admin";

const CityMiniMap = dynamic(
  () => import("@/components/organisms/admin/CityMiniMap").then((m) => m.CityMiniMap),
  { ssr: false },
);

const TOP_CITY_COUNT = 3;

interface CitySummary {
  city: string;
  province: string;
  count: number;
  share: number;
  lat: number;
  lng: number;
}

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

export function CityDensityShortcuts() {
  const t = useTranslations("admin.dashboard");

  const { data, isLoading } = useQuery<AdminUserGeoResponse>({
    queryKey: ["admin", "users", "geo"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.USERS.GEO),
    staleTime: 300_000,
  });

  const topCities = useMemo<CitySummary[]>(() => {
    const points = data?.points ?? [];
    if (points.length === 0) return [];

    const groups = new Map<string, { province: string; lat: number; lng: number; count: number }>();

    for (const point of points) {
      const group = groups.get(point.city) ?? {
        province: point.province,
        lat: 0,
        lng: 0,
        count: 0,
      };
      group.lat += point.lat;
      group.lng += point.lng;
      group.count += 1;
      groups.set(point.city, group);
    }

    return [...groups.entries()]
      .map(([city, group]) => ({
        city,
        province: group.province,
        count: group.count,
        share: Math.round((group.count / points.length) * 100),
        lat: group.lat / group.count,
        lng: group.lng / group.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_CITY_COUNT);
  }, [data]);

  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("densityTitle")}</h2>
          <p className="text-muted mt-1 text-xs">{t("densitySubtitle")}</p>
        </div>
        <Link
          href={ROUTES.ADMIN.USER_MAP}
          className="text-primary hover:bg-primary/10 shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
        >
          {t("densityViewAll")}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {isLoading &&
          Array.from({ length: TOP_CITY_COUNT }).map((_, index) => (
            <div key={index} className="bg-surface-2 h-28 animate-pulse rounded-xl" />
          ))}

        {topCities.map((city, index) => (
          <Link
            key={city.city}
            href={`${ROUTES.ADMIN.USER_MAP}?${MAP_CITY_QUERY}=${encodeURIComponent(city.city)}`}
            className="group border-border hover:border-primary/50 relative flex items-stretch gap-3 overflow-hidden rounded-xl border p-3 transition-colors"
          >
            <div className="border-border relative size-16 shrink-0 overflow-hidden rounded-lg border">
              <CityMiniMap lat={city.lat} lng={city.lng} />
              <span className="bg-primary/15 group-hover:bg-primary/5 absolute inset-0 transition-colors" />
              <span className="border-primary bg-primary/70 absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[0.625rem] font-bold tabular-nums">
                  {pn(index + 1)}
                </span>
                <MapPin size={13} className="text-primary shrink-0" />
                <span className="text-foreground truncate text-sm font-semibold">{city.city}</span>
              </div>
              <p className="text-muted truncate text-[0.6875rem]">{city.province}</p>
              <p className="text-foreground text-xs font-bold tabular-nums">
                {t("densityUsers", { count: pn(city.count) })}
                <span className="text-muted me-1.5 font-medium"> · {pn(city.share)}٪</span>
              </p>
            </div>

            <ChevronLeft
              size={16}
              className="text-muted group-hover:text-primary self-center transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
