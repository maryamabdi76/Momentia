/**
 * Colours for the sky chart, one palette per poster style. Plain data and
 * functions, no React, so the same file serves the chart and the tests.
 */

/** The poster styles, in the order the picker lists them. */
export const SKY_VARIANTS = ['mono', 'gold', 'black', 'parchment', 'violet'] as const;
export type SkyChartVariant = (typeof SKY_VARIANTS)[number];

export type Palette = {
  ring: string;
  ringSoft: string;
  figure: string;
  figureOpacity: number;
  star: (bv: number) => string;
  moon: string;
  planet: string;
  label: string;
  /** Ecliptic and equator. */
  guide: string;
};

type RGB = [number, number, number];
const lerp = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const hex = ([r, g, b]: RGB) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** B−V colour index → a tint running blue-white → white → mid → warm end. */
function tint(blue: RGB, white: RGB, mid: RGB, warm: RGB) {
  return (bv: number): string => {
    if (bv <= 0) return hex(blue);
    if (bv < 0.6) return hex(lerp(blue, white, bv / 0.6));
    if (bv < 1.2) return hex(lerp(white, mid, (bv - 0.6) / 0.6));
    return hex(lerp(mid, warm, Math.min(1, (bv - 1.2) / 0.5)));
  };
}

// gentle: blue-white, white, cream, amber
const warmStar = tint([214, 226, 255], [255, 248, 235], [255, 230, 190], [255, 206, 158]);
// cooler and cleaner for the black poster: silver-blue to white, barely any warmth
const silverStar = tint([205, 220, 255], [250, 251, 255], [255, 244, 226], [255, 224, 190]);
// lavender-white with a rosy warm end for the violet poster
const roseStar = tint([220, 214, 255], [255, 246, 248], [255, 226, 220], [255, 200, 184]);

export const PALETTES: Record<SkyChartVariant, Palette> = {
  gold: {
    ring: '#CEB47B',
    ringSoft: '#CEB47B',
    figure: '#CEB47B',
    figureOpacity: 0.5,
    star: warmStar,
    moon: '#EAD9AA',
    planet: '#FFD9A0',
    label: '#E8D9B8',
    guide: '#E3C88A',
  },
  mono: {
    ring: '#2a2a28',
    ringSoft: '#2a2a28',
    figure: '#2a2a28',
    figureOpacity: 0.42,
    star: () => '#1c1c1a',
    moon: '#1c1c1a',
    planet: '#1c1c1a',
    label: '#2a2a28',
    guide: '#2a2a28',
  },
  black: {
    ring: '#C9CDD6',
    ringSoft: '#C9CDD6',
    figure: '#C9CDD6',
    figureOpacity: 0.45,
    star: silverStar,
    moon: '#F2F3F5',
    planet: '#FFF1D6',
    label: '#E4E6EB',
    guide: '#BFC4CE',
  },
  parchment: {
    ring: '#6b4a2b',
    ringSoft: '#6b4a2b',
    figure: '#6b4a2b',
    figureOpacity: 0.5,
    // ink-dark dots; the planets get a faded red so they read as "different"
    star: () => '#3a2714',
    moon: '#3a2714',
    planet: '#8a3a1c',
    label: '#4a321b',
    guide: '#7a4a1e',
  },
  violet: {
    ring: '#E2A9A0',
    ringSoft: '#E2A9A0',
    figure: '#E2A9A0',
    figureOpacity: 0.5,
    star: roseStar,
    moon: '#F5D9D2',
    planet: '#FFD3C4',
    label: '#F1D3CC',
    guide: '#EDB9AE',
  },
};
