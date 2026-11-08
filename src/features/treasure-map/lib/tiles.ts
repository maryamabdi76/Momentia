import { toMeters, type View } from './mercator.ts';

/** Half of the Earth's circumference at the equator, in Web Mercator metres. */
const HALF = Math.PI * 6378137;
const TILE_METRES_AT_Z0 = (2 * HALF) / 256;

/**
 * The background of the map: label-free, light or dark base maps, so the poster shows the
 * shape of the streets and rivers without a single street name. Data © OpenStreetMap
 * contributors, tiles © CARTO. To use another provider, change this one function.
 */
export type TileStyle = 'light' | 'dark';

export function tileUrl(style: TileStyle, z: number, x: number, y: number): string {
  const sub = 'abcd'[(x + y) % 4];
  return `https://${sub}.basemaps.cartocdn.com/${style}_nolabels/${z}/${x}/${y}@2x.png`;
}

export type TileSpec = { url: string; left: number; top: number; size: number };

/** The zoom whose tiles are at least as sharp as the poster needs: one tile pixel per poster pixel or finer. */
export function pickZoom(metresPerPx: number, lat: number): number {
  const mercatorMpp = metresPerPx / Math.cos((lat * Math.PI) / 180);
  const z = Math.ceil(Math.log2(TILE_METRES_AT_Z0 / mercatorMpp));
  return Math.max(3, Math.min(19, z));
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
