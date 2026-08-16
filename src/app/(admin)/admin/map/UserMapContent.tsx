"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check, MapPin, Search, Users, X } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { MAP_CITY_QUERY } from "@/config/map";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import { cn } from "@/lib/utils";
import type { UserDensityMapLabels } from "@/components/organisms/admin/UserDensityMap";
import type { AdminUserGeoResponse } from "@/types/admin";

// Leaflet touches `window` on import, so the map only renders on the client.
const UserDensityMap = dynamic(
  () => import("@/components/organisms/admin/UserDensityMap").then((m) => m.UserDensityMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

function MapSkeleton() {
  return <div className="bg-surface-2 h-[34rem] w-full animate-pulse rounded-2xl" />;
}

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

/** Unifies Arabic/Persian letter variants so "کرمانشاه" matches "كرمانشاه". */
function foldText(value: string): string {
  return normalizeSearchInput(value)
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, " ");
}

export function UserMapContent() {
  const t = useTranslations("admin.userMap");
  const tStatus = useTranslations("admin.users.status");

  const mapLabels = useMemo<UserDensityMapLabels>(
    () => ({
      users: t("usersUnit"),
      mobile: t("cardMobile"),
      location: t("cardLocation"),
      status: t("cardStatus"),
      details: t("cardDetails"),
      detailsSoon: t("cardDetailsSoon"),
      zoomIn: t("zoomIn"),
      zoomOut: t("zoomOut"),
      fullscreen: t("fullscreen"),
      exitFullscreen: t("exitFullscreen"),
      statusOf: (point) => tStatus(point.status),
    }),
    [t, tStatus],
  );

  const { data, isLoading } = useQuery<AdminUserGeoResponse>({
    queryKey: ["admin", "users", "geo"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.USERS.GEO),
    staleTime: 300_000,
  });

  const searchParams = useSearchParams();
  const [city, setCity] = useState<string | null>(
    () => searchParams.get(MAP_CITY_QUERY) || null,
  );
  const [provinceQuery, setProvinceQuery] = useState("");
  const [province, setProvince] = useState<string | null>(null);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const provinceRef = useRef<HTMLDivElement>(null);

  const deferredUserQuery = useDeferredValue(userQuery);

  const points = useMemo(() => data?.points ?? [], [data]);

  const provinces = useMemo(
    () => [...new Set(points.map((point) => point.province))].sort((a, b) => a.localeCompare(b, "fa")),
    [points],
  );

  const provinceOptions = useMemo(() => {
    const needle = foldText(provinceQuery);
    if (!needle) return provinces;
    return provinces.filter((name) => foldText(name).includes(needle));
  }, [provinces, provinceQuery]);

  const filteredPoints = useMemo(() => {
    const needle = foldText(deferredUserQuery);

    return points.filter((point) => {
      if (city && point.city !== city) return false;
      if (province && point.province !== province) return false;
      if (!needle) return true;

      return (
        foldText(point.fullName).includes(needle) ||
        point.mobile.includes(needle) ||
        foldText(point.city).includes(needle)
      );
    });
  }, [points, city, province, deferredUserQuery]);

  const topCities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const point of filteredPoints) {
      counts.set(point.city, (counts.get(point.city) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filteredPoints]);

  const hasFilters = city !== null || province !== null || userQuery.trim().length > 0;

  useEffect(() => {
    if (!provinceOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!provinceRef.current?.contains(event.target as Node)) setProvinceOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [provinceOpen]);

  function selectProvince(name: string | null) {
    setProvince(name);
    setProvinceQuery(name ?? "");
    setProvinceOpen(false);
  }

  function resetFilters() {
    setCity(null);
    setProvince(null);
    setProvinceQuery("");
    setUserQuery("");
  }

  const inputCls =
    "border-border bg-surface-2 text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border py-2.5 ps-10 pe-9 text-sm outline-none transition-colors";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
          <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
        </div>
        <div className="border-border bg-surface flex items-center gap-2 rounded-xl border px-4 py-2">
          <Users size={16} className="text-primary" />
          <span className="text-muted text-xs">{t("totalUsers")}</span>
          <span className="text-foreground text-sm font-bold tabular-nums">
            {pn(data?.total ?? 0)}
          </span>
        </div>
      </div>

      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-foreground text-sm font-semibold">{t("filtersTitle")}</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted text-xs tabular-nums">
              {t("resultCount", { count: pn(filteredPoints.length) })}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-primary hover:bg-primary/10 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
              >
                {t("resetFilters")}
              </button>
            )}
          </div>
        </div>

        {city && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium">
              <MapPin size={12} />
              {t("cityChip", { city })}
              <button
                type="button"
                onClick={() => setCity(null)}
                aria-label={t("resetFilters")}
                className="hover:text-foreground"
              >
                <X size={13} />
              </button>
            </span>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative" ref={provinceRef}>
            <label className="text-muted mb-1.5 block text-xs">{t("provinceLabel")}</label>
            <div className="relative">
              <MapPin
                size={16}
                className="text-muted pointer-events-none absolute top-1/2 start-3 -translate-y-1/2"
              />
              <input
                value={provinceQuery}
                onChange={(event) => {
                  setProvinceQuery(event.target.value);
                  setProvinceOpen(true);
                  if (province) setProvince(null);
                }}
                onFocus={() => setProvinceOpen(true)}
                placeholder={t("provincePlaceholder")}
                className={inputCls}
              />
              {provinceQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectProvince(null)}
                  aria-label={t("provinceAll")}
                  className="text-muted hover:text-foreground absolute top-1/2 end-3 -translate-y-1/2"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {provinceOpen && (
              <div className="border-border bg-surface absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border p-1 shadow-xl shadow-black/10">
                <button
                  type="button"
                  onClick={() => selectProvince(null)}
                  className="text-muted hover:bg-surface-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm"
                >
                  {t("provinceAll")}
                  {province === null && <Check size={14} className="text-primary" />}
                </button>
                {provinceOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectProvince(name)}
                    className={cn(
                      "hover:bg-surface-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm",
                      province === name ? "text-primary font-medium" : "text-foreground",
                    )}
                  >
                    {name}
                    {province === name && <Check size={14} className="text-primary" />}
                  </button>
                ))}
                {provinceOptions.length === 0 && (
                  <p className="text-muted px-3 py-3 text-xs">{t("provinceEmpty")}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("userLabel")}</label>
            <div className="relative">
              <Search
                size={16}
                className="text-muted pointer-events-none absolute top-1/2 start-3 -translate-y-1/2"
              />
              <input
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                placeholder={t("userPlaceholder")}
                className={inputCls}
              />
              {userQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUserQuery("")}
                  aria-label={t("resetFilters")}
                  className="text-muted hover:text-foreground absolute top-1/2 end-3 -translate-y-1/2"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-border bg-surface relative overflow-hidden rounded-2xl border p-3">
        {isLoading ? (
          <MapSkeleton />
        ) : (
          <UserDensityMap
            points={filteredPoints}
            labels={mapLabels}
            fitKey={`${city ?? "all"}|${province ?? "all"}|${deferredUserQuery.trim()}`}
          />
        )}
        {!isLoading && filteredPoints.length === 0 && (
          <p className="text-muted absolute inset-x-0 top-1/2 z-[500] text-center text-sm font-medium">
            <span className="bg-surface border-border rounded-xl border px-4 py-2 shadow-lg">
              {t("noResults")}
            </span>
          </p>
        )}
      </section>

      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <h2 className="text-foreground text-sm font-semibold">{t("topCitiesTitle")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topCities.map(([city, count]) => (
            <div key={city} className="border-border rounded-xl border p-3">
              <div className="text-muted flex items-center gap-1.5 text-xs">
                <MapPin size={13} />
                {city}
              </div>
              <p className="text-foreground mt-1 text-lg font-bold tabular-nums">{pn(count)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
