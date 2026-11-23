import { loadFonts, svgToPngBlob } from '@/features/poster/lib/export-poster';
import { artSrc, type MapArt } from './art';
import {
  buildTreasureMapSvg,
  mapTiles,
  type TreasureMapData,
  type TreasureMapLabels,
} from './map-svg';

export { svgToPngBlob };

const tileCache = new Map<string, Promise<string>>();

/** One map tile as a data: URI, so the exported file stands on its own. */
function loadTile(url: string): Promise<string> {
  let hit = tileCache.get(url);
  if (!hit) {
    hit = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`tile ${res.status}`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          }),
      );
    tileCache.set(url, hit);
    // a failed tile should not poison later attempts
    hit.catch(() => tileCache.delete(url));
  }
  return hit;
}

/** A paid file must not have holes in its map, so a tile that fails is tried once more before giving up. */
async function loadTileWithRetry(url: string): Promise<string> {
  try {
    return await loadTile(url);
  } catch {
    await new Promise((r) => setTimeout(r, 400));
    return loadTile(url);
  }
}

/** The file is drawn about three times larger than the preview, so its map tiles are two zoom levels sharper. */
const EXPORT_TILE_DETAIL = 2;

export async function createMapSvg(input: {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  watermark: boolean;
}): Promise<string> {
  const tiles = mapTiles(input.data, EXPORT_TILE_DETAIL);
  // the road's watercolour pictures, once each, embedded like the tiles
  const arts = input.data.layout === 'road' ? [...new Set(input.data.milestones.flatMap((m) => (m.art ? [m.art] : [])))] : [];
  const [fonts, images, artImages] = await Promise.all([
    loadFonts(),
    Promise.all(tiles.map(async (t) => [t.url, await loadTileWithRetry(t.url)] as const)),
    Promise.all(arts.map(async (a) => [a, await loadTileWithRetry(artSrc(a, input.data.theme === 'ink' ? 'line' : 'color'))] as const)),
  ]);
  return buildTreasureMapSvg({
    ...input,
    fonts,
    tileImages: Object.fromEntries(images),
    artImages: Object.fromEntries(artImages) as Partial<Record<MapArt, string>>,
    idPrefix: 'export',
    tileDetail: EXPORT_TILE_DETAIL,
  });
}
