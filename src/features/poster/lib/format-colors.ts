import { POSTER_THEMES, type PosterStyle } from './themes.ts';
import type { FormatColors } from './render-format.ts';

/** The flat colours behind the poster for a style: its paper edge and its card backdrop. */
export function formatColors(style: PosterStyle): FormatColors {
  const theme = POSTER_THEMES[style];
  return { paper: theme.paperStops[theme.paperStops.length - 1]![1], mat: theme.mat };
}
