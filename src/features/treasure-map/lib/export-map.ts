import { loadFonts, svgToPngBlob } from '@/features/poster/lib/export-poster';
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

export async function createMapSvg(input: {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  watermark: boolean;
}): Promise<string> {
  const tiles = mapTiles(input.data);
  const [fonts, images] = await Promise.all([
    loadFonts(),
    Promise.all(tiles.map(async (t) => [t.url, await loadTile(t.url)] as const)),
  ]);
  return buildTreasureMapSvg({ ...input, fonts, tileImages: Object.fromEntries(images), idPrefix: 'export' });
}
