/**
 * @level organism
 * Non-interactive OpenStreetMap thumbnail centred on a city — used as a shortcut preview.
 */
"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_PREVIEW_ZOOM, MAP_ZOOM, OSM_TILE_URL } from "@/config/map";

export function CityMiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="nib-map-preview pointer-events-none absolute inset-0">
      <MapContainer
        center={[lat, lng]}
        zoom={MAP_PREVIEW_ZOOM}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        className="h-full w-full"
      >
        <TileLayer url={OSM_TILE_URL} maxZoom={MAP_ZOOM.max} noWrap />
      </MapContainer>
    </div>
  );
}
