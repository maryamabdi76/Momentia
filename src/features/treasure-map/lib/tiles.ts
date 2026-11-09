import { toMeters, type View } from './mercator.ts';

/** Half of the Earth's circumference at the equator, in Web Mercator metres. */
const HALF = Math.PI * 6378137;
const TILE_METRES_AT_Z0 = (2 * HALF) / 256;

/**
 * The background of the map: label-free, light or dark base maps, so the poster shows the
 * shape of the streets and rivers without a single street name.
 *
 * The default is Esri's World Light / Dark Gray base maps, which need no key. They are fine to
 * try the feature, but for a shop use a provider you have an account with and set
 * NEXT_PUBLIC_MAP_TILE_LIGHT_URL and NEXT_PUBLIC_MAP_TILE_DARK_URL (templates with {z}, {x}, {y};
 * a label-free style), and NEXT_PUBLIC_MAP_TILE_MAX_ZOOM if it differs. Update the `credit` text in
 * messages/fa.json to match the provider.
 */
export type TileStyle = 'light' | 'dark';

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const DEFAULT_TEMPLATES: Record<TileStyle, string> = {
  light: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
  dark: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
};

function template(style: TileStyle): string {
  // read each variable literally: Next.js only inlines `process.env.NEXT_PUBLIC_X` written out in full
  const custom = style === 'light' ? process.env.NEXT_PUBLIC_MAP_TILE_LIGHT_URL : process.env.NEXT_PUBLIC_MAP_TILE_DARK_URL;
  return custom || DEFAULT_TEMPLATES[style];
}

/** The deepest zoom the tile source has. Esri's gray base maps stop at 16. */
export function maxTileZoom(): number {
  const custom = Number(process.env.NEXT_PUBLIC_MAP_TILE_MAX_ZOOM);
  if (Number.isFinite(custom) && custom > 0) return Math.min(19, Math.floor(custom));
  return process.env.NEXT_PUBLIC_MAP_TILE_LIGHT_URL ? 19 : 16;
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
 * The tiles that cover a circle of radius `r` around `centre` on the poster, with where each one goes.
 * North is up; the view's centre sits on `centre`.
 */
export function tilesFor(view: View, centre: { x: number; y: number }, r: number, style: TileStyle): TileSpec[] {
  const z = pickZoom(view.metresPerPx, view.center.lat);
  const mpp = view.metresPerPx / Math.cos((view.center.lat * Math.PI) / 180); // mercator metres per poster pixel
  const c = toMeters(view.center);
  const tileM = (2 * HALF) / 2 ** z;
  const n = 2 ** z;
  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
  const minX = clamp(Math.floor((c.x - r * mpp + HALF) / tileM));
  const maxX = clamp(Math.floor((c.x + r * mpp + HALF) / tileM));
  const minY = clamp(Math.floor((HALF - (c.y + r * mpp)) / tileM));
  const maxY = clamp(Math.floor((HALF - (c.y - r * mpp)) / tileM));
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
