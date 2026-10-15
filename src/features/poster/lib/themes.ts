import { SKY_VARIANTS, type SkyChartVariant } from '../../sky/lib/palettes.ts';

/**
 * Every poster style in one place. The on-screen preview (CSS) and the exported
 * SVG/PNG both read from here, so a style looks the same in both.
 */
export const POSTER_STYLES = SKY_VARIANTS;
export type PosterStyle = SkyChartVariant;

export type PosterTheme = {
  /** Background gradient stops, 0…1. */
  paperStops: Array<[offset: number, color: string]>;
  /** A top-to-bottom linear gradient instead of the soft radial glow. */
  linear: boolean;
  frame: string;
  frameSoft: string;
  ink: string;
  accent: string;
  muted: string;
  /** Colour of the soft halo behind the chart; null for none (light papers). */
  glow: string | null;
  /** Dark paper: decides which fallback illustration is shown. */
  dark: boolean;
};

export const POSTER_THEMES: Record<PosterStyle, PosterTheme> = {
  // classic: navy sky, gold linework
  gold: {
    paperStops: [
      [0, '#1a2f5c'],
      [0.45, '#0f2147'],
      [1, '#08132b'],
    ],
    linear: false,
    frame: '#CEB47B',
    frameSoft: 'rgba(206,180,123,0.45)',
    ink: '#F1E6C8',
    accent: '#E3C88A',
    muted: 'rgba(241,230,200,0.62)',
    glow: '#CEB47B',
    dark: true,
  },
  // clean white paper, black ink
  mono: {
    paperStops: [
      [0, '#fbf9f4'],
      [1, '#f3efe5'],
    ],
    linear: true,
    frame: '#2a2a28',
    frameSoft: 'rgba(42,42,40,0.35)',
    ink: '#1c1c1a',
    accent: '#1c1c1a',
    muted: 'rgba(28,28,26,0.62)',
    glow: null,
    dark: false,
  },
  // deep black, silver linework: the high-contrast look most star maps sell in
  black: {
    paperStops: [
      [0, '#17181d'],
      [0.45, '#0c0d10'],
      [1, '#030304'],
    ],
    linear: false,
    frame: '#C9CDD6',
    frameSoft: 'rgba(201,205,214,0.4)',
    ink: '#F4F5F7',
    accent: '#D9DCE3',
    muted: 'rgba(244,245,247,0.6)',
    glow: '#C9CDD6',
    dark: true,
  },
  // aged paper, sepia ink: an old navigational chart
  parchment: {
    paperStops: [
      [0, '#f6ecd3'],
      [0.55, '#eadbb7'],
      [1, '#d9c598'],
    ],
    linear: false,
    frame: '#6b4a2b',
    frameSoft: 'rgba(107,74,43,0.4)',
    ink: '#3a2714',
    accent: '#7a4a1e',
    muted: 'rgba(58,39,20,0.68)',
    glow: null,
    dark: false,
  },
  // deep plum night, rose-gold linework: a softer, warmer dark
  violet: {
    paperStops: [
      [0, '#3a1f5c'],
      [0.45, '#241240'],
      [1, '#120826'],
    ],
    linear: false,
    frame: '#E2A9A0',
    frameSoft: 'rgba(226,169,160,0.45)',
    ink: '#F7E6E2',
    accent: '#EDB9AE',
    muted: 'rgba(247,230,226,0.62)',
    glow: '#E2A9A0',
    dark: true,
  },
};

/** The same background as a CSS `background` value (preview and picker swatch). */
export function paperCss(theme: PosterTheme): string {
  const stops = theme.paperStops
    .map(([o, c]) => `${c} ${Math.round(o * 100)}%`)
    .join(',');
  return theme.linear
    ? `linear-gradient(180deg,${stops})`
    : `radial-gradient(120% 70% at 50% 38%,${stops})`;
}

export function isPosterStyle(value: unknown): value is PosterStyle {
  return typeof value === 'string' && (POSTER_STYLES as readonly string[]).includes(value);
}
