/** Web Mercator maths, the projection of OpenStreetMap tiles and of the street map on the poster. */
export const TILE = 256;
const MAX_LAT = 85.0511;

export type LonLat = { lon: number; lat: number };

const clampLat = (lat: number) => Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));

/** Pixel position on the whole-world map at a zoom level. */
export function lonLatToWorld({ lon, lat }: LonLat, zoom: number): { x: number; y: number } {
  const size = TILE * 2 ** zoom;
  const sin = Math.sin((clampLat(lat) * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

export function worldToLonLat(x: number, y: number, zoom: number): LonLat {
  const size = TILE * 2 ** zoom;
  const lon = (x / size) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / size))) * 180) / Math.PI;
  return { lon, lat };
}

/** Metres on the ground are `scale` times map units at this latitude. */
export const metresPerUnit = (lat: number) => 1 / Math.cos((lat * Math.PI) / 180);

export type View = {
  center: LonLat;
  /** Ground metres per poster pixel. */
  metresPerPx: number;
};

/** Mercator "metres" (unit sphere scaled to the Earth's radius), the plane the poster is drawn on. */
const R_EARTH = 6378137;
export function toMeters({ lon, lat }: LonLat): { x: number; y: number } {
  const sin = Math.sin((clampLat(lat) * Math.PI) / 180);
  return {
    x: (lon * Math.PI * R_EARTH) / 180,
    y: (R_EARTH / 2) * Math.log((1 + sin) / (1 - sin)),
  };
}

export function fromMeters(x: number, y: number): LonLat {
  return {
    lon: (x / (Math.PI * R_EARTH)) * 180,
    lat: ((2 * Math.atan(Math.exp(y / R_EARTH)) - Math.PI / 2) * 180) / Math.PI,
  };
}

/**
 * How to frame the pins in a shape of radius `r` pixels: centred on them, zoomed so
 * they sit inside the middle of the shape, but never closer than ~1.5 km across.
 */
export function frameView(points: LonLat[], r: number): View {
  const m = points.map(toMeters);
  const xs = m.map((p) => p.x);
  const ys = m.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const center = fromMeters(cx, cy);
  // mercator metres stretch away from the equator; this makes them true ground metres
  const k = Math.cos((center.lat * Math.PI) / 180);
  const spanX = (maxX - minX) * k;
  const spanY = (maxY - minY) * k;
  const metresPerPx = Math.max(spanX / (r * 1.0), spanY / (r * 0.62), 1500 / (r * 2));
  return { center, metresPerPx };
}

/** Where a point lands on the poster, north up. */
export function projectToPoster(
  p: LonLat,
  view: View,
  centre: { x: number; y: number },
): { x: number; y: number } {
  const c = toMeters(view.center);
  const m = toMeters(p);
  const k = Math.cos((view.center.lat * Math.PI) / 180);
  const mpp = view.metresPerPx / k; // mercator metres per pixel
  return { x: centre.x + (m.x - c.x) / mpp, y: centre.y - (m.y - c.y) / mpp };
}

/** The lon/lat box that covers a shape of radius `r` around the centre, with a margin. */
export function viewBounds(view: View, r: number, margin = 1.15) {
  const c = toMeters(view.center);
  const k = Math.cos((view.center.lat * Math.PI) / 180);
  const half = (r * margin * view.metresPerPx) / k;
  const sw = fromMeters(c.x - half, c.y - half);
  const ne = fromMeters(c.x + half, c.y + half);
  return { south: sw.lat, west: sw.lon, north: ne.lat, east: ne.lon };
}

/** Approximate width of a bounds box in kilometres. */
export function boundsKm(b: { south: number; west: number; north: number; east: number }): number {
  const mid = (b.south + b.north) / 2;
  const w = (b.east - b.west) * 111.32 * Math.cos((mid * Math.PI) / 180);
  const h = (b.north - b.south) * 110.57;
  return Math.max(w, h);
}
