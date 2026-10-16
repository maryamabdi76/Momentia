import { loadFonts, svgToPngBlob } from '@/features/poster/lib/export-poster';
import {
  MOON_IMAGE_URL,
  buildMoonPosterSvg,
  type MoonFacts,
  type MoonLabels,
  type MoonPosterData,
} from './moon-svg';

export { svgToPngBlob };

let imageCache: Promise<string> | null = null;

/** The Moon photograph as a data: URI, so the exported file stands on its own. */
function loadMoonImage(): Promise<string> {
  imageCache ??= fetch(MOON_IMAGE_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`moon image: ${res.status}`);
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
  // a failed load should not poison later attempts
  imageCache.catch(() => {
    imageCache = null;
  });
  return imageCache;
}

export async function createMoonSvg(input: {
  data: MoonPosterData;
  facts: MoonFacts;
  labels: MoonLabels;
  watermark: boolean;
}): Promise<string> {
  const [fonts, imageHref] = await Promise.all([loadFonts(), loadMoonImage()]);
  return buildMoonPosterSvg({ ...input, fonts, imageHref, idPrefix: 'export' });
}
