/**
 * A font size that keeps a line of text inside a width: the given size when it already fits,
 * otherwise smaller (never below `min`). Persian text averages a little over half an em per character.
 */
export function fitFont(text: string, size: number, maxWidth: number, min = 11): number {
  const chars = [...text].length;
  if (chars === 0) return size;
  const width = chars * size * 0.56;
  if (width <= maxWidth) return size;
  return Math.max(min, Math.floor((maxWidth / (chars * 0.56)) * 10) / 10);
}
