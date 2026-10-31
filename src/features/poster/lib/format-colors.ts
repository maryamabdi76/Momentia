import { POSTER_THEMES, type PosterStyle } from './themes.ts';
import type { FormatColors } from './render-format.ts';

/**
 * The flat colours behind the poster for a style. Story and wallpaper use the same
 * deep colour as the poster's own edge, so the file reads as one piece of paper.
 */
export function formatColors(style: PosterStyle): FormatColors {
  const theme = POSTER_THEMES[style];
  const paper = theme.paperStops[theme.paperStops.length - 1]![1];
  return { paper, mat: paper };
}
