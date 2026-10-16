import { renderToStaticMarkup } from 'react-dom/server';
import { SkyChart } from '@/features/sky/components/SkyChart';
import { SkyField } from '@/features/sky/components/SkyField';
import type { SkySnapshot } from '@/features/sky/lib/types';
import type { PosterData, PosterLabels } from '../components/PosterPreview';
import { FULL_LAYOUT } from './templates';
import { POSTER_THEMES } from './themes';
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  buildPosterSvg,
  type PosterFonts,
} from './poster-svg';

/** Width of the watermarked PNG, and of the premium one. */
export const FREE_PNG_WIDTH = 1500;
export const PREMIUM_PNG_WIDTH = 3000;

let fontCache: Promise<PosterFonts> | null = null;

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${url}: ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

/** The two Vazirmatn weights, embedded so the file looks the same everywhere. */
export function loadFonts(): Promise<PosterFonts> {
  fontCache ??= Promise.all([
    toBase64('/fonts/vazirmatn/Vazirmatn-Regular.woff2'),
    toBase64('/fonts/vazirmatn/Vazirmatn-Bold.woff2'),
  ]).then(([regular, bold]) => ({ regular, bold }));
  // a failed load should not poison later attempts
  fontCache.catch(() => {
    fontCache = null;
  });
  return fontCache;
}

export type ExportInput = {
  data: PosterData;
  labels: PosterLabels;
  sky: SkySnapshot | null;
  watermark: boolean;
};

export async function createPosterSvg({
  data,
  labels,
  sky,
  watermark,
}: ExportInput): Promise<string> {
  const fonts = await loadFonts();
  const chartSvg = !sky
    ? ''
    : renderToStaticMarkup(
        data.template === 'full' ? (
          <SkyField
            sky={sky}
            variant={data.style}
            layers={data.layers}
            {...FULL_LAYOUT}
            compass={{
              north: labels.north,
              south: labels.south,
              east: labels.east,
              west: labels.west,
            }}
            compassColor={POSTER_THEMES[data.style].muted}
            ariaLabel={labels.mapAlt}
          />
        ) : (
          <SkyChart
            sky={sky}
            variant={data.style}
            layers={data.layers}
            ariaLabel={labels.mapAlt}
          />
        ),
      );
  return buildPosterSvg({ data, labels, chartSvg, fonts, watermark });
}

export async function svgToPngBlob(svg: string, width: number): Promise<Blob> {
  const height = Math.round((width * POSTER_HEIGHT) / POSTER_WIDTH);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    // Some browsers resolve embedded fonts a frame late; a first throwaway
    // draw makes the second one reliable.
    ctx.drawImage(img, 0, 0, width, height);
    await new Promise((r) => setTimeout(r, 60));
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('png encode failed'))),
        'image/png',
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
