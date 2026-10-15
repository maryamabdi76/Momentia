/**
 * How the poster is laid out, separate from its colours (`themes.ts`).
 *
 *   circle  the sky as a round chart in the middle of the page, text below
 *   full    the whole page is sky; the text sits over it
 */
export const POSTER_TEMPLATES = ['circle', 'full'] as const;
export type PosterTemplate = (typeof POSTER_TEMPLATES)[number];

export const DEFAULT_TEMPLATE: PosterTemplate = 'circle';

export function isPosterTemplate(value: unknown): value is PosterTemplate {
  return typeof value === 'string' && (POSTER_TEMPLATES as readonly string[]).includes(value);
}

/**
 * Geometry of the "full" template on the 900 × 1350 poster canvas. The preview
 * and the exported file both read it, so they line up.
 */
export const FULL_LAYOUT = {
  width: 900,
  height: 1350,
  /** Where the zenith sits, and the horizon circle's radius. */
  centerX: 450,
  centerY: 540,
  radius: 370,
} as const;

/**
 * How far below the horizon the sky is computed for the full template. From the
 * zenith the farthest visible corner is ~52° down; the bottom fades into the
 * paper before that.
 */
export const FULL_SKY_DEPTH = 52;
