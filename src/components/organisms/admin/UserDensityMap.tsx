/**
 * @level organism
 * OpenStreetMap density view of all members, locked to Iran and clustered by area.
 */
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { IRAN_BOUNDS, IRAN_CENTER, MAP_ZOOM, OSM_ATTRIBUTION, OSM_TILE_URL } from "@/config/map";
import type { AdminUserGeoPoint } from "@/types/admin";

export interface UserDensityMapLabels {
  users: string;
  mobile: string;
  location: string;
  status: string;
  details: string;
  detailsSoon: string;
  zoomIn: string;
  zoomOut: string;
  fullscreen: string;
  exitFullscreen: string;
  statusOf: (point: AdminUserGeoPoint) => string;
}

const PIN_SIZE = 20;

/** Above four digits the label no longer fits the bubble, so it is capped with a "+". */
const CLUSTER_LABEL_CAP = 999;

function clusterLabel(count: number): string {
  const value = count > CLUSTER_LABEL_CAP ? CLUSTER_LABEL_CAP : count;
  return `${value.toLocaleString("en-US")}${count > CLUSTER_LABEL_CAP ? "+" : ""}`;
}

/** Cluster bubble size scales with how many members fall inside it. */
function clusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 38 : count < 50 ? 46 : count < 200 ? 56 : 66;
  const label = clusterLabel(count);

  return L.divIcon({
    html: `<span>${label}</span>`,
    className: `nib-map-cluster${label.length > 3 ? " is-compact" : ""}`,
    iconSize: L.point(size, size),
  });
}

function memberIcon(): L.DivIcon {
  return L.divIcon({ className: "nib-map-pin", iconSize: L.point(PIN_SIZE, PIN_SIZE) });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Popup body is built as DOM so the "more details" button can own a real listener. */
function memberCard(point: AdminUserGeoPoint, labels: UserDensityMapLabels): HTMLElement {
  const root = L.DomUtil.create("div", "nib-map-card");

  const rows = [
    [labels.mobile, point.mobile],
    [labels.location, `${point.city} — ${point.province}`],
    [labels.status, labels.statusOf(point)],
  ];

  root.innerHTML = `
    <strong class="nib-map-card__name">${escapeHtml(point.fullName)}</strong>
    <dl class="nib-map-card__rows">
      ${rows
        .map(
          ([label, value]) =>
            `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
        )
        .join("")}
    </dl>`;

  const button = L.DomUtil.create("button", "nib-map-card__action", root);
  button.type = "button";
  button.textContent = labels.details;

  L.DomEvent.on(button, "click", (event) => {
    L.DomEvent.stop(event);
    button.textContent = labels.detailsSoon;
    button.classList.add("is-soon");
    button.disabled = true;
  });

  return root;
}

function clusterTooltip(cluster: L.MarkerCluster, usersLabel: string): string {
  const children = cluster.getAllChildMarkers() as (L.Marker & {
    options: { nibPoint?: AdminUserGeoPoint };
  })[];

  const byCity = new Map<string, number>();
  for (const child of children) {
    const point = child.options.nibPoint;
    if (!point) continue;
    byCity.set(point.city, (byCity.get(point.city) ?? 0) + 1);
  }

  const rows = [...byCity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(
      ([city, count]) =>
        `<span>${escapeHtml(city)}: <b>${count.toLocaleString("en-US")}</b></span>`,
    )
    .join("");

  return `
    <div class="nib-map-tooltip">
      <strong>${cluster.getChildCount().toLocaleString("en-US")} ${escapeHtml(usersLabel)}</strong>
      ${rows}
    </div>`;
}

function ClusteredMembers({
  points,
  labels,
  fitKey,
  focusPointId,
}: {
  points: AdminUserGeoPoint[];
  labels: UserDensityMapLabels;
  fitKey: string;
  focusPointId?: string | null;
}) {
  const map = useMap();
  // `null` forces an initial fit so a deep link (e.g. ?city=…) opens framed on its result.
  const lastFitKey = useRef<string | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: MAP_ZOOM.max,
      iconCreateFunction: (cluster) => clusterIcon(cluster.getChildCount()),
    });

    let focusMarker: L.Marker | null = null;

    for (const point of points) {
      const marker = L.marker([point.lat, point.lng], {
        icon: memberIcon(),
        riseOnHover: true,
        nibPoint: point,
      } as L.MarkerOptions);

      marker.bindPopup(() => memberCard(point, labels), {
        className: "nib-map-popup",
        // Anchors the card to the right of the pin instead of floating above it.
        offset: L.point(112, 56),
        closeButton: true,
        autoPanPadding: L.point(24, 24),
        minWidth: 190,
        maxWidth: 190,
      });

      // Hover reveals the card; it stays open so the action inside stays clickable.
      marker.on("mouseover", () => marker.openPopup());
      marker.addTo(group);

      if (focusPointId && point.id === focusPointId) {
        focusMarker = marker;
      }
    }

    group.on("clustermouseover", (event) => {
      const cluster = event.propagatedFrom as L.MarkerCluster;
      cluster
        .bindTooltip(clusterTooltip(cluster, labels.users), {
          direction: "top",
          className: "nib-map-tooltip-wrap",
        })
        .openTooltip();
    });

    map.addLayer(group);

    // Re-frame the viewport only when the filters changed the visible set.
    if (fitKey !== lastFitKey.current && points.length > 0) {
      lastFitKey.current = fitKey;
      if (focusMarker) {
        const latLng = focusMarker.getLatLng();
        map.flyTo(latLng, MAP_ZOOM.focus, { animate: true });
        window.setTimeout(() => focusMarker?.openPopup(), 350);
      } else {
        const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
        map.fitBounds(bounds.pad(0.25), { maxZoom: MAP_ZOOM.focus, animate: true });
      }
    }

    return () => {
      group.off();
      map.removeLayer(group);
    };
  }, [map, points, labels, fitKey, focusPointId]);

  return null;
}

function MapControls({
  containerRef,
  labels,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  labels: UserDensityMapLabels;
}) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      requestAnimationFrame(() => map.invalidateSize());
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [containerRef, map]);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await containerRef.current?.requestFullscreen();
  }

  const controlClass =
    "border-border bg-surface/95 text-foreground hover:bg-surface-2 flex size-9 items-center justify-center border shadow-sm backdrop-blur-sm transition first:rounded-t-lg last:rounded-b-lg";

  return (
    <div className="leaflet-top leaflet-left">
      <div className="leaflet-control flex flex-col overflow-hidden rounded-lg" dir="ltr">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label={labels.zoomIn}
          title={labels.zoomIn}
          className={controlClass}
        >
          <Plus size={17} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label={labels.zoomOut}
          title={labels.zoomOut}
          className={controlClass}
        >
          <Minus size={17} />
        </button>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
          title={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
          className={controlClass}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}

export function UserDensityMap({
  points,
  labels,
  fitKey,
  focusPointId,
}: {
  points: AdminUserGeoPoint[];
  labels: UserDensityMapLabels;
  fitKey: string;
  /** When set, fly to this member and open their popup. */
  focusPointId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="nib-map-shell relative h-[34rem] w-full rounded-2xl">
      <MapContainer
        center={IRAN_CENTER}
        zoom={MAP_ZOOM.initial}
        minZoom={MAP_ZOOM.min}
        maxZoom={MAP_ZOOM.max}
        maxBounds={IRAN_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full rounded-2xl"
      >
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          minZoom={MAP_ZOOM.min}
          maxZoom={MAP_ZOOM.max}
          maxNativeZoom={19}
          noWrap
        />
        <ClusteredMembers
          points={points}
          labels={labels}
          fitKey={fitKey}
          focusPointId={focusPointId}
        />
        <MapControls containerRef={containerRef} labels={labels} />
      </MapContainer>
    </div>
  );
}
