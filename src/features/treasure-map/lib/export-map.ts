import { loadFonts, svgToPngBlob } from '@/features/poster/lib/export-poster';
import type { StreetData } from './streets';
import { buildTreasureMapSvg, type TreasureMapLabels, type TreasureMapData } from './map-svg';

export { svgToPngBlob };

export async function createMapSvg(input: {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  streets?: StreetData | null;
  watermark: boolean;
}): Promise<string> {
  const fonts = await loadFonts();
  return buildTreasureMapSvg({ ...input, fonts, idPrefix: 'export' });
}
