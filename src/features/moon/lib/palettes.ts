import type { PosterStyle } from '../../poster/lib/themes.ts';

/** How the unlit side and the ring around the Moon are coloured on each paper. */
export type MoonPalette = {
  /** The unlit side, drawn over the surface at `shadowOpacity` (the rest is earthshine). */
  shadow: string;
  shadowOpacity: number;
  /** Soft light around the Moon; null on light papers. */
  halo: string | null;
  /** Ring drawn around the disc. */
  ring: string;
};

export const MOON_PALETTES: Record<PosterStyle, MoonPalette> = {
  gold: { shadow: '#050b1c', shadowOpacity: 0.84, halo: '#CEB47B', ring: '#CEB47B' },
  mono: { shadow: '#1c1c1a', shadowOpacity: 0.93, halo: null, ring: '#1c1c1a' },
  black: { shadow: '#000000', shadowOpacity: 0.9, halo: '#C9CDD6', ring: '#C9CDD6' },
  parchment: { shadow: '#3a2714', shadowOpacity: 0.9, halo: null, ring: '#6b4a2b' },
  violet: { shadow: '#0d0620', shadowOpacity: 0.84, halo: '#E2A9A0', ring: '#E2A9A0' },
};
