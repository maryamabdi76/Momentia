import starsJson from './data/stars.json';
import linesJson from './data/constellation-lines.json';
import artJson from './data/constellation-art.json';
import artImagesJson from './data/art-images.json';
import type { SkyCatalog } from './lib/types';

/**
 * The bundled star catalog (≈ 2,850 stars to magnitude 5.5) and the 89
 * constellation figures. Imported only where a chart is actually computed, so
 * pages that just show the static poster image don't pay for the data.
 * Rebuild with `node scripts/build-sky-data.mjs` — see data/NOTICE.txt.
 */
export const skyCatalog: SkyCatalog = {
  stars: starsJson.stars as unknown as SkyCatalog['stars'],
  lines: linesJson.lines as unknown as SkyCatalog['lines'],
  art: artJson.figures as unknown as SkyCatalog['art'],
  images: artImagesJson.images as unknown as SkyCatalog['images'],
};
