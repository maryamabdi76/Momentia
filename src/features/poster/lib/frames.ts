import type { PosterTheme } from './themes.ts';

/**
 * The border drawn around the poster, separate from its layout (`templates.ts`) and
 * its colours (`themes.ts`).
 *
 *   classic  two fine lines and an ornament in each corner
 *   minimal  one fine line
 *   double   a heavier outer line and a fine inner one, no ornaments
 *   stars    a fine line with a four-point star on every corner and side
 *   rounded  two lines with rounded corners
 *   deco     two lines with cut corners and a small diamond in each
 *   none     no border
 *
 * Each frame is one SVG fragment on the 900 × 1350 poster canvas. The on-screen
 * preview embeds the very same fragment the exported file does, so the two cannot
 * drift apart.
 */
export const POSTER_FRAMES = [
  'classic',
  'minimal',
  'double',
  'stars',
  'rounded',
  'deco',
  'none',
] as const;
export type PosterFrame = (typeof POSTER_FRAMES)[number];

export const DEFAULT_FRAME: PosterFrame = 'classic';

export function isPosterFrame(value: unknown): value is PosterFrame {
  return typeof value === 'string' && (POSTER_FRAMES as readonly string[]).includes(value);
}

export type FrameColors = Pick<PosterTheme, 'frame' | 'frameSoft'>;

export type FrameOptions = {
  /** Multiplies every line width; a small picker thumbnail needs heavier lines to stay visible. */
  strokeScale?: number;
};

const num = (n: number) => +n.toFixed(2);

// ── building blocks ───────────────────────────────────────────────────────────

/** A rectangle `inset` units in from every edge of the page. */
function box(
  W: number,
  H: number,
  inset: number,
  stroke: string,
  width: number,
  radius = 0,
) {
  return (
    `<rect x="${num(inset)}" y="${num(inset)}" width="${num(W - 2 * inset)}" height="${num(H - 2 * inset)}"` +
    (radius ? ` rx="${num(radius)}"` : '') +
    ` fill="none" stroke="${stroke}" stroke-width="${num(width)}"/>`
  );
}

/** The four-point star used on the divider, as a path centred on the origin and 10 units across. */
const STAR_PATH = 'M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z';

function star(color: string, x: number, y: number, radius: number) {
  return `<path transform="translate(${num(x)} ${num(y)}) scale(${num(radius / 5)})" d="${STAR_PATH}" fill="${color}"/>`;
}

function diamond(color: string, x: number, y: number, r: number) {
  return `<path d="M${num(x - r)} ${num(y)} L${num(x)} ${num(y - r)} L${num(x + r)} ${num(y)} L${num(x)} ${num(y + r)}Z" fill="${color}"/>`;
}

/** The corner ornament of the classic frame: an L-shaped curve with a dot. */
function ornament(color: string, x: number, y: number, sx: 1 | -1, sy: 1 | -1) {
  const k = 2.25; // the 20-unit icon becomes 45 units
  return `<g transform="translate(${x} ${y}) scale(${sx * k} ${sy * k}) translate(-1 -1)" fill="none" stroke="${color}" stroke-width="0.9"><path d="M1 19 V6 Q1 1 6 1 H19"/><circle cx="6" cy="6" r="1.3" fill="${color}" stroke="none"/></g>`;
}

/** A rectangle with its four corners cut at 45°, `cut` units along each side. */
function chamfered(W: number, H: number, inset: number, cut: number, stroke: string, width: number) {
  const x0 = inset;
  const y0 = inset;
  const x1 = W - inset;
  const y1 = H - inset;
  const d =
    `M${num(x0 + cut)} ${num(y0)}H${num(x1 - cut)}L${num(x1)} ${num(y0 + cut)}` +
    `V${num(y1 - cut)}L${num(x1 - cut)} ${num(y1)}H${num(x0 + cut)}L${num(x0)} ${num(y1 - cut)}` +
    `V${num(y0 + cut)}Z`;
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${num(width)}"/>`;
}

// ── the frames ────────────────────────────────────────────────────────────────

// Distances from the page edge, in poster units. The text column starts 63–81 units
// in, so every straight line stays well clear of it (see `FRAME_REACH`).
const CLASSIC = { outer: 21.6, inner: 33.3, line: 1.4 } as const;
const MINIMAL = { inset: 30, line: 1.6 } as const;
const DOUBLE = { outer: 20, outerLine: 2.6, inner: 35, innerLine: 1.2 } as const;
const STARS = { line: 30, lineWidth: 1.2, soft: 40, softWidth: 1, corner: 16, side: 8 } as const;
const ROUNDED = { outer: 24, outerRadius: 46, inner: 36, innerRadius: 34, line: 1.6, innerLine: 1 } as const;
const DECO = { outer: 24, inner: 36, cut: 46, line: 1.8, innerLine: 1, jewel: 4 } as const;

/**
 * How far in from the page edge each frame's straight lines reach (their inner
 * edge, stroke included). The test keeps this clear of the text column.
 */
export const FRAME_REACH: Record<PosterFrame, number> = {
  classic: CLASSIC.inner + CLASSIC.line / 2,
  minimal: MINIMAL.inset + MINIMAL.line / 2,
  double: DOUBLE.inner + DOUBLE.innerLine / 2,
  stars: STARS.soft + STARS.softWidth / 2,
  rounded: ROUNDED.inner + ROUNDED.innerLine / 2,
  deco: DECO.inner + DECO.innerLine / 2,
  none: 0,
};

/** The frame as SVG markup for a `W` × `H` poster canvas; an empty string for `none`. */
export function frameSvg(
  frame: PosterFrame,
  colors: FrameColors,
  W: number,
  H: number,
  { strokeScale = 1 }: FrameOptions = {},
): string {
  const { frame: strong, frameSoft: soft } = colors;
  const s = (width: number) => width * strokeScale;

  switch (frame) {
    case 'classic':
      return (
        box(W, H, CLASSIC.outer, strong, s(CLASSIC.line)) +
        box(W, H, CLASSIC.inner, soft, s(CLASSIC.line)) +
        ornament(strong, 41, 41, 1, 1) +
        ornament(strong, W - 41, 41, -1, 1) +
        ornament(strong, 41, H - 41, 1, -1) +
        ornament(strong, W - 41, H - 41, -1, -1)
      );

    case 'minimal':
      return box(W, H, MINIMAL.inset, strong, s(MINIMAL.line));

    case 'double':
      return (
        box(W, H, DOUBLE.outer, strong, s(DOUBLE.outerLine)) +
        box(W, H, DOUBLE.inner, strong, s(DOUBLE.innerLine))
      );

    case 'stars': {
      const { line, corner, side } = STARS;
      return (
        box(W, H, line, strong, s(STARS.lineWidth)) +
        box(W, H, STARS.soft, soft, s(STARS.softWidth)) +
        star(strong, line, line, corner) +
        star(strong, W - line, line, corner) +
        star(strong, line, H - line, corner) +
        star(strong, W - line, H - line, corner) +
        star(strong, W / 2, line, side) +
        star(strong, W / 2, H - line, side) +
        star(strong, line, H / 2, side) +
        star(strong, W - line, H / 2, side)
      );
    }

    case 'rounded':
      return (
        box(W, H, ROUNDED.outer, strong, s(ROUNDED.line), ROUNDED.outerRadius) +
        box(W, H, ROUNDED.inner, soft, s(ROUNDED.innerLine), ROUNDED.innerRadius)
      );

    case 'deco': {
      const { outer, inner, cut, jewel } = DECO;
      // moving a 45° edge in by `d` shortens its cut by d·(2 − √2), so both lines stay parallel
      const innerCut = cut - (inner - outer) * (2 - Math.SQRT2);
      // a diamond halfway between the two cut edges of each corner
      const mid = (outer + cut / 2 + inner + innerCut / 2) / 2;
      return (
        chamfered(W, H, outer, cut, strong, s(DECO.line)) +
        chamfered(W, H, inner, innerCut, soft, s(DECO.innerLine)) +
        diamond(strong, mid, mid, jewel) +
        diamond(strong, W - mid, mid, jewel) +
        diamond(strong, mid, H - mid, jewel) +
        diamond(strong, W - mid, H - mid, jewel)
      );
    }

    case 'none':
      return '';
  }
}
