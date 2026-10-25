import type { SkyLayers } from '@/features/sky/lib/layers';
import { isPremiumTemplate, type PosterTemplate } from './templates.ts';

/**
 * Does this poster use anything premium? Then it has no free download (PNG, SVG
 * and share are locked) and the file is only handed out as the paid,
 * watermark-free PNG. Premium so far: the full-page sky layout and the painted
 * constellation figures.
 */
export function usesPremiumFeatures(poster: {
  template: PosterTemplate;
  layers?: Partial<Pick<SkyLayers, 'constellationArt'>> | null;
}): boolean {
  return isPremiumTemplate(poster.template) || poster.layers?.constellationArt === true;
}
