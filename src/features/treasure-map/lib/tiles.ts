import { toMeters, type View } from './mercator.ts';

/** Half of the Earth's circumference at the equator, in Web Mercator metres. */
const HALF = Math.PI * 6378137;
const TILE_METRES_AT_Z0 = (2 * HALF) / 256;

/**
 * The background of the map: OpenStreetMap's standard tiles, the same ones the Leaflet picker shows,
 * washed out to a single soft tone by the filter in map-svg.ts so the poster reads as a quiet
 * line drawing.
 *
 * openstreetmap.org's tile servers are meant for light use. For a shop use a provider you have an
 * account with and set NEXT_PUBLIC_MAP_TILE_LIGHT_URL (and _DARK_URL; templates with {z}, {x}, {y}),
 * NEXT_PUBLIC_MAP_TILE_MAX_ZOOM if it differs, and update the `credit` text in messages/fa.json.
 */
export type TileStyle = 'light' | 'dark';

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

function template(style: TileStyle): string {
  // read each variable literally: Next.js only inlines `process.env.NEXT_PUBLIC_X` written out in full
  const custom = style === 'light' ? process.env.NEXT_PUBLIC_MAP_TILE_LIGHT_URL : process.env.NEXT_PUBLIC_MAP_TILE_DARK_URL;
  return custom || process.env.NEXT_PUBLIC_MAP_TILE_LIGHT_URL || OSM;
}

/** The deepest zoom the tile source has. */
export function maxTileZoom(): number {
  const custom = Number(process.env.NEXT_PUBLIC_MAP_TILE_MAX_ZOOM);
  return Number.isFinite(custom) && custom > 0 ? Math.min(19, Math.floor(custom)) : 19;
}

export function tileUrl(style: TileStyle, z: number, x: number, y: number): string {
  return template(style).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
}

export type TileSpec = { url: string; left: number; top: number; size: number };

/** The zoom whose tiles are at least as sharp as the poster needs: one tile pixel per poster pixel or finer. */
export function pickZoom(metresPerPx: number, lat: number, maxZoom = maxTileZoom()): number {
  const mercatorMpp = metresPerPx / Math.cos((lat * Math.PI) / 180);
  const z = Math.ceil(Math.log2(TILE_METRES_AT_Z0 / mercatorMpp));
  return Math.max(3, Math.min(maxZoom, z));
}

/**
 * The tiles that cover a box around `centre` on the poster, with where each one goes.
 * North is up; the view's centre sits on `centre`.
 */
export function tilesFor(
  view: View,
  centre: { x: number; y: number },
  /** Half the width and height to cover, in poster pixels; one number covers a square. */
  half: number | { x: number; y: number },
  style: TileStyle,
  /** Extra zoom levels beyond what the poster needs: an exported file is drawn several times larger than the preview. */
  boost = 0,
): TileSpec[] {
  const hx = typeof half === 'number' ? half : half.x;
  const hy = typeof half === 'number' ? half : half.y;
  const z = Math.min(maxTileZoom(), pickZoom(view.metresPerPx, view.center.lat) + boost);
  const mpp = view.metresPerPx / Math.cos((view.center.lat * Math.PI) / 180); // mercator metres per poster pixel
  const c = toMeters(view.center);
  const tileM = (2 * HALF) / 2 ** z;
  const n = 2 ** z;
  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
  const minX = clamp(Math.floor((c.x - hx * mpp + HALF) / tileM));
  const maxX = clamp(Math.floor((c.x + hx * mpp + HALF) / tileM));
  const minY = clamp(Math.floor((HALF - (c.y + hy * mpp)) / tileM));
  const maxY = clamp(Math.floor((HALF - (c.y - hy * mpp)) / tileM));
  const size = tileM / mpp;
  const out: TileSpec[] = [];
  for (let ty = minY; ty <= maxY; ty++) {
    for (let tx = minX; tx <= maxX; tx++) {
      out.push({
        url: tileUrl(style, z, tx, ty),
        left: centre.x + (tx * tileM - HALF - c.x) / mpp,
        top: centre.y - (HALF - ty * tileM - c.y) / mpp,
        size,
      });
    }
  }
  return out;
}
