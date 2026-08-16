import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

/** Iran bounding box — panning outside of it is blocked. */
export const IRAN_BOUNDS: LatLngBoundsExpression = [
  [24.5, 43.5],
  [40.0, 63.5],
];

export const IRAN_CENTER: LatLngExpression = [32.4279, 53.688];

export const MAP_ZOOM = {
  initial: 5,
  min: 5,
  max: 17,
  /** Zoom applied when a filter narrows the result set to a single area. */
  focus: 11,
} as const;

/** Query param that pre-filters the density map to a single city. */
export const MAP_CITY_QUERY = "city";

/** Zoom for the non-interactive city thumbnails on the dashboard. */
export const MAP_PREVIEW_ZOOM = 9;

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
