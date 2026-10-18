import type { PosterData, PosterLabels } from '../components/PosterPreview';
import { POSTER_THEMES } from './themes.ts';

/**
 * The poster as one self-contained SVG string — the single source for every
 * file we hand out (SVG download, PNG download, share). It mirrors the on-screen
 * PosterPreview, laid out on a 900 × 1350 canvas.
 *
 * The preview is sized in `cqw` (1% of the poster's width), so every number below
 * is written the same way (`n * CQW`) and the two can be compared line by line.
 * When you change a size or a margin in PosterPreview, change it here too.
 */
export const POSTER_WIDTH = 900;
export const POSTER_HEIGHT = 1350;

const CQW = POSTER_WIDTH / 100;

// Padding of the preview's content column: px-[9cqw] pt-[8cqw] pb-[7cqw].
const PAD_X = 9 * CQW;
const PAD_TOP = 8 * CQW;
const CONTENT_BOTTOM = POSTER_HEIGHT - 7 * CQW;
const CONTENT_WIDTH = POSTER_WIDTH - 2 * PAD_X;
const COLUMN_HEIGHT = CONTENT_BOTTOM - PAD_TOP;

/** Chart: `w-[78%]` of the content column. */
const CHART_MAX = 0.78 * CONTENT_WIDTH;

/**
 * Every text style of the preview: font size, line height and where the
 * baseline sits inside its line box. `baseline` is Vazirmatn's measured offset
 * (in em) from the centre of the line box to the baseline; it differs a little
 * per size because browsers round ascent and descent to whole pixels.
 */
const STYLE = {
  eyebrow: { size: 3 * CQW, lh: 1.5, baseline: 0.2407 },
  compass: { size: 2.6 * CQW, lh: 1.5, baseline: 0.2094 },
  title: { size: 7.2 * CQW, lh: 1.35, baseline: 0.2284 },
  names: { size: 4.4 * CQW, lh: 1.5, baseline: 0.2424 },
  quote: { size: 3.5 * CQW, lh: 1.9, baseline: 0.2143 },
  meta: { size: 3.1 * CQW, lh: 1.5, baseline: 0.2204 },
  mark: { size: 2.2 * CQW, lh: 1.5, baseline: 0.2172 },
} as const;
type StyleName = keyof typeof STYLE;

const lineHeight = (s: StyleName) => STYLE[s].size * STYLE[s].lh;
/** Baseline of a line whose box starts at `top`. */
const baselineAt = (s: StyleName, top: number) =>
  top + lineHeight(s) / 2 + STYLE[s].baseline * STYLE[s].size;

// Margins between the blocks (all in the preview's cqw).
const CHART_GAP = 8 * CQW; // eyebrow → chart
const TEXT_GAP = 9 * CQW; // chart → text block (circle layout)
const NAMES_GAP = 1.6 * CQW; // title → names
const DIVIDER_GAP = 3.6 * CQW; // names/title → divider
const QUOTE_GAP = 3.4 * CQW; // divider/names/title → quote
const META_PAD = 4 * CQW; // padding above the meta line, and gap above it (full layout)
const MARK_GAP = 2.6 * CQW; // meta → watermark
const DIVIDER_HEIGHT = 2.8 * CQW;
const COMPASS_GAP = { top: 1.2 * CQW, side: 1.6 * CQW } as const;

export type PosterFonts = { regular: string; bold: string };

/** Width in px of `text` set in Vazirmatn at `fontSize`. */
export type Measure = (text: string, fontSize: number, weight: 400 | 700) => number;

/** Average glyph width: stands in for real font metrics (tests, servers, a font that failed to load). */
export const estimateWidth: Measure = (text, fontSize, weight) =>
  text.length * fontSize * (weight === 700 ? 0.56 : 0.52);

export type PosterSvgOptions = {
  data: PosterData;
  labels: PosterLabels;
  /** Markup of the sky chart (an `<svg>` element) produced by SkyChart. */
  chartSvg: string;
  /** Base64 woff2 data so text renders identically on any device. Omit for a lighter file. */
  fonts?: PosterFonts;
  /** The small "آسمان شب ما" mark; the premium file leaves it out. */
  watermark: boolean;
  /**
   * Real text widths, so lines break exactly where the on-screen preview breaks
   * them. Without it an average glyph width is assumed.
   */
  measure?: Measure;
};

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Greedy word wrap using an average glyph width; good enough for Vazirmatn. */
export function wrapText(
  text: string,
  fontSize: number,
  maxWidth: number,
  em = 0.52,
): string[] {
  const maxChars = Math.max(4, Math.floor(maxWidth / (fontSize * em)));
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function greedyLines(words: string[], maxWidth: number, widthOf: (s: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Word wrap by measured width. Never drops a word: a long text just gets more
 * lines. With `balance` the lines are evened out the way CSS `text-wrap: balance`
 * does it (same line count, narrowest width that still fits), which is what the
 * preview's title and quote use.
 */
export function wrapLines(
  text: string,
  fontSize: number,
  weight: 400 | 700,
  maxWidth: number,
  measure: Measure,
  balance: boolean,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const widthOf = (s: string) => measure(s, fontSize, weight);
  const lines = greedyLines(words, maxWidth, widthOf);
  // Browsers only balance short blocks (up to 6 lines).
  if (!balance || lines.length < 2 || lines.length > 6) return lines;
  return balancedLines(words, maxWidth, widthOf, lines.length) ?? lines;
}

/**
 * Splits `words` into exactly `count` lines, none wider than `maxWidth`, so that
 * the lines come out as even as possible (least sum of squared widths). This is
 * how Chromium's `text-wrap: balance` breaks, and it is why a long title ends in
 * two similar lines rather than one full line and a short one.
 */
function balancedLines(
  words: string[],
  maxWidth: number,
  widthOf: (s: string) => number,
  count: number,
): string[] | null {
  const n = words.length;
  const cache = new Map<number, number>();
  const lineWidth = (i: number, j: number) => {
    const key = i * (n + 1) + j;
    let w = cache.get(key);
    if (w === undefined) {
      w = widthOf(words.slice(i, j).join(' '));
      cache.set(key, w);
    }
    return w;
  };

  // best[k][j]: cheapest way to set the first j words in k lines
  const best: number[][] = Array.from({ length: count + 1 }, () =>
    new Array<number>(n + 1).fill(Infinity),
  );
  const from: number[][] = Array.from({ length: count + 1 }, () => new Array<number>(n + 1).fill(0));
  best[0]![0] = 0;
  for (let k = 1; k <= count; k++) {
    for (let j = k; j <= n; j++) {
      for (let i = k - 1; i < j; i++) {
        const prev = best[k - 1]![i]!;
        if (prev === Infinity) continue;
        const w = lineWidth(i, j);
        if (w > maxWidth && j - i > 1) continue; // only a single long word may overflow
        const cost = prev + w * w;
        if (cost < best[k]![j]!) {
          best[k]![j] = cost;
          from[k]![j] = i;
        }
      }
    }
  }
  if (best[count]![n] === Infinity) return null;

  const out: string[] = [];
  for (let k = count, j = n; k > 0; k--) {
    const i = from[k]![j]!;
    out.unshift(words.slice(i, j).join(' '));
    j = i;
  }
  return out;
}

function corner(color: string, x: number, y: number, sx: 1 | -1, sy: 1 | -1) {
  const k = 2.25; // the 20-unit icon becomes 45 units
  return `<g transform="translate(${x} ${y}) scale(${sx * k} ${sy * k}) translate(-1 -1)" fill="none" stroke="${color}" stroke-width="0.9"><path d="M1 19 V6 Q1 1 6 1 H19"/><circle cx="6" cy="6" r="1.3" fill="${color}" stroke="none"/></g>`;
}

/** Fades from clear into the paper's edge colour, so text sits on a calm ground. */
function scrimDefs(color: string) {
  const stop = (o: number, a: number) =>
    `<stop offset="${o}" stop-color="${color}" stop-opacity="${a}"/>`;
  return (
    `<linearGradient id="scrimBottom" x1="0" y1="0" x2="0" y2="1">${stop(0, 0)}${stop(0.22, 0.55)}${stop(0.45, 0.9)}${stop(1, 0.97)}</linearGradient>` +
    `<linearGradient id="scrimTop" x1="0" y1="0" x2="0" y2="1">${stop(0, 0.85)}${stop(1, 0)}</linearGradient>`
  );
}

export function buildPosterSvg(opts: PosterSvgOptions): string {
  const { data: p, labels: l, chartSvg, fonts, watermark } = opts;
  const measure = opts.measure ?? estimateWidth;
  const t = POSTER_THEMES[p.style];
  const W = POSTER_WIDTH;
  const H = POSTER_HEIGHT;
  const cx = W / 2;

  const text = (
    content: string,
    x: number,
    y: number,
    size: number,
    fill: string,
    weight: 400 | 700 = 400,
  ) =>
    `<text x="${+x.toFixed(2)}" y="${+y.toFixed(2)}" font-size="${+size.toFixed(2)}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl">${esc(content)}</text>`;
  const widthOf = (s: string, style: StyleName, weight: 400 | 700 = 400) =>
    measure(s, STYLE[style].size, weight);

  // the full template needs the sky markup; without it the circle layout stands in
  const full = p.template === 'full' && chartSvg.length > 0;
  // `under` is painted before the frame (the sky of the full template), `parts` after it.
  const under: string[] = [];
  const parts: string[] = [];

  // ── what is on the page (same conditions as the preview) ────────────────
  const hasTitle = Boolean(p.title);
  const hasNames = Boolean(p.names);
  const hasQuote = Boolean(p.quote);
  const hasTextBlock = hasTitle || hasNames || hasQuote;
  const showDivider = (hasTitle || hasNames) && hasQuote;
  const meta = [
    p.showCity ? p.city : null,
    p.showDate ? p.dateLabel : null,
    p.showDate && p.timeLabel ? `${l.timeAt} ${p.timeLabel}` : null,
  ].filter((m): m is string => Boolean(m));
  const showMark = watermark && Boolean(l.watermark);

  // ── text, wrapped by measured width ─────────────────────────────────────
  const titleLines = hasTitle
    ? wrapLines(p.title, STYLE.title.size, 700, CONTENT_WIDTH, measure, true)
    : [];
  const quoteLines = hasQuote
    ? wrapLines(p.quote, STYLE.quote.size, 400, 0.88 * CONTENT_WIDTH, measure, true)
    : [];

  const textHeight =
    titleLines.length * lineHeight('title') +
    (hasNames ? (hasTitle ? NAMES_GAP : 0) + lineHeight('names') : 0) +
    (showDivider ? DIVIDER_GAP + DIVIDER_HEIGHT : 0) +
    (hasQuote
      ? (showDivider || hasTitle || hasNames ? QUOTE_GAP : 0) +
        quoteLines.length * lineHeight('quote')
      : 0);

  // ── the bottom stack: meta line, then the mark, pinned to the bottom edge ─
  const markHeight = showMark ? lineHeight('mark') : 0;
  const metaHeight = meta.length ? META_PAD + lineHeight('meta') : 0;
  const markGap = markHeight && metaHeight ? MARK_GAP : 0;
  const metaTop = CONTENT_BOTTOM - markHeight - markGap - metaHeight;
  const stackHeight = markHeight + markGap + metaHeight;

  // ── where the text block starts ─────────────────────────────────────────
  let textTop: number;
  let chartSize = CHART_MAX;
  const chartTop = PAD_TOP + lineHeight('eyebrow') + CHART_GAP;

  if (full) {
    // bottom-anchored: the block ends a fixed gap above the meta line (or the mark)
    const above = metaHeight
      ? metaTop - META_PAD
      : markHeight
        ? CONTENT_BOTTOM - markHeight - MARK_GAP
        : CONTENT_BOTTOM;
    textTop = above - textHeight;
  } else {
    // The chart gives way when the text needs the room, as it does in the preview.
    const taken =
      lineHeight('eyebrow') + CHART_GAP + (hasTextBlock ? TEXT_GAP + textHeight : 0) + stackHeight;
    chartSize = Math.max(0, Math.min(CHART_MAX, COLUMN_HEIGHT - taken));
    textTop = chartTop + chartSize + TEXT_GAP;
  }

  // ── eyebrow ─────────────────────────────────────────────────────────────
  parts.push(
    text(l.headerLine, cx, baselineAt('eyebrow', PAD_TOP), STYLE.eyebrow.size, t.accent),
  );

  if (full) {
    // the whole page is sky; it already carries its own compass words
    under.push(
      chartSvg.replace('<svg ', `<svg x="0" y="0" width="${W}" height="${H}" `),
    );
    under.push(
      `<rect x="0" y="0" width="${W}" height="${(H * 0.193).toFixed(2)}" fill="url(#scrimTop)"/>` +
        `<rect x="0" y="${(H * (1 - 0.422)).toFixed(2)}" width="${W}" height="${(H * 0.422).toFixed(2)}" fill="url(#scrimBottom)"/>`,
    );
  } else if (chartSize > 0) {
    const chartX = (W - chartSize) / 2;
    const chartCy = chartTop + chartSize / 2;
    if (t.glow) {
      parts.push(
        `<circle cx="${cx}" cy="${+chartCy.toFixed(2)}" r="${+(chartSize * 0.56).toFixed(2)}" fill="url(#glow)"/>`,
      );
    }
    // compass: north on top, east on the left (we are looking up)
    const c = STYLE.compass;
    const ch = lineHeight('compass');
    const compassSize = +c.size.toFixed(2);
    parts.push(
      text(l.north, cx, baselineAt('compass', chartTop - COMPASS_GAP.top - ch), compassSize, t.muted),
      text(l.south, cx, baselineAt('compass', chartTop + chartSize + COMPASS_GAP.top), compassSize, t.muted),
      text(
        l.east,
        chartX - COMPASS_GAP.side - widthOf(l.east, 'compass') / 2,
        baselineAt('compass', chartCy - ch / 2),
        compassSize,
        t.muted,
      ),
      text(
        l.west,
        chartX + chartSize + COMPASS_GAP.side + widthOf(l.west, 'compass') / 2,
        baselineAt('compass', chartCy - ch / 2),
        compassSize,
        t.muted,
      ),
    );
    parts.push(
      chartSvg.replace(
        '<svg ',
        `<svg x="${+chartX.toFixed(2)}" y="${+chartTop.toFixed(2)}" width="${+chartSize.toFixed(2)}" height="${+chartSize.toFixed(2)}" `,
      ),
    );
  }

  // ── title block ─────────────────────────────────────────────────────────
  let y = textTop;
  titleLines.forEach((line) => {
    parts.push(text(line, cx, baselineAt('title', y), STYLE.title.size, t.ink, 700));
    y += lineHeight('title');
  });
  if (hasNames) {
    if (hasTitle) y += NAMES_GAP;
    parts.push(text(p.names, cx, baselineAt('names', y), STYLE.names.size, t.accent));
    y += lineHeight('names');
  }
  if (showDivider) {
    y += DIVIDER_GAP;
    const dy = y + DIVIDER_HEIGHT / 2;
    const line = 16 * CQW;
    const offset = 2.4 * CQW + DIVIDER_HEIGHT / 2; // gap + half the star
    parts.push(
      `<rect x="${cx - offset - line}" y="${+(dy - 0.5).toFixed(2)}" width="${line}" height="1" fill="url(#divL)"/>` +
        `<rect x="${cx + offset}" y="${+(dy - 0.5).toFixed(2)}" width="${line}" height="1" fill="url(#divR)"/>` +
        `<path transform="translate(${cx} ${+dy.toFixed(2)}) scale(${(DIVIDER_HEIGHT / 10).toFixed(3)})" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="${t.frame}"/>`,
    );
    y += DIVIDER_HEIGHT;
  }
  if (hasQuote) {
    if (showDivider || hasTitle || hasNames) y += QUOTE_GAP;
    quoteLines.forEach((line) => {
      parts.push(text(line, cx, baselineAt('quote', y), STYLE.quote.size, t.muted));
      y += lineHeight('quote');
    });
  }

  // ── meta: place · date · time, with a small diamond between the parts ───
  if (meta.length) {
    const gap = 3 * CQW;
    const diamond = 0.9 * CQW;
    const between = gap + diamond + gap;
    const widths = meta.map((m) => widthOf(m, 'meta'));
    const total = widths.reduce((a, b) => a + b, 0) + between * (meta.length - 1);
    const base = baselineAt('meta', metaTop + META_PAD);
    // right to left: the place first, as in the preview
    let right = cx + total / 2;
    meta.forEach((m, i) => {
      parts.push(text(m, right - widths[i]! / 2, base, STYLE.meta.size, t.ink));
      right -= widths[i]!;
      if (i < meta.length - 1) {
        const dx = right - between / 2;
        const r = diamond / Math.SQRT2; // a square rotated 45° has this half-diagonal
        const dyc = metaTop + META_PAD + lineHeight('meta') / 2;
        parts.push(
          `<path d="M${+(dx - r).toFixed(2)} ${+dyc.toFixed(2)} L${+dx.toFixed(2)} ${+(dyc - r).toFixed(2)} L${+(dx + r).toFixed(2)} ${+dyc.toFixed(2)} L${+dx.toFixed(2)} ${+(dyc + r).toFixed(2)}Z" fill="${t.frame}"/>`,
        );
        right -= between;
      }
    });
  }

  if (showMark) {
    parts.push(
      text(l.watermark, cx, baselineAt('mark', CONTENT_BOTTOM - markHeight), STYLE.mark.size, t.muted),
    );
  }

  const fontCss = fonts
    ? `@font-face{font-family:'Vazirmatn';font-weight:400;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2')}` +
      `@font-face{font-family:'Vazirmatn';font-weight:700;src:url(data:font/woff2;base64,${fonts.bold}) format('woff2')}`
    : '';

  const paper = t.linear
    ? `<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">${t.paperStops
        .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
        .join('')}</linearGradient>`
    : `<radialGradient id="paper" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${H * 0.38}" r="${H * 0.78}" gradientTransform="translate(${cx} ${H * 0.38}) scale(1.2 0.7) translate(${-cx} ${-H * 0.38})">${t.paperStops
        .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
        .join('')}</radialGradient>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(l.mapAlt)}">` +
    `<defs><style>${fontCss}text{font-family:'Vazirmatn',Tahoma,sans-serif}</style>` +
    paper +
    (t.glow
      ? `<radialGradient id="glow"><stop offset="0" stop-color="${t.glow}" stop-opacity="0.16"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>`
      : '') +
    // the lines are bright at the outer ends and fade toward the star
    `<linearGradient id="divL" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}"/><stop offset="1" stop-color="${t.frame}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="divR" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}" stop-opacity="0"/><stop offset="1" stop-color="${t.frame}"/></linearGradient>` +
    (full ? scrimDefs(t.paperStops[t.paperStops.length - 1]![1]) : '') +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#paper)"/>` +
    under.join('') +
    `<rect x="21.6" y="21.6" width="${W - 43.2}" height="${H - 43.2}" fill="none" stroke="${t.frame}" stroke-width="1.4"/>` +
    `<rect x="33.3" y="33.3" width="${W - 66.6}" height="${H - 66.6}" fill="none" stroke="${t.frameSoft}" stroke-width="1.4"/>` +
    corner(t.frame, 41, 41, 1, 1) +
    corner(t.frame, W - 41, 41, -1, 1) +
    corner(t.frame, 41, H - 41, 1, -1) +
    corner(t.frame, W - 41, H - 41, -1, -1) +
    parts.join('') +
    `</svg>`
  );
}
