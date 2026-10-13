import type { PosterData, PosterLabels } from '../components/PosterPreview';

/**
 * The poster as one self-contained SVG string — the single source for every
 * file we hand out (SVG download, PNG download, share). It mirrors the on-screen
 * PosterPreview, laid out on a 900 × 1350 canvas.
 */
export const POSTER_WIDTH = 900;
export const POSTER_HEIGHT = 1350;

const CHART_SIZE = 576;
const CHART_X = (POSTER_WIDTH - CHART_SIZE) / 2;
const CHART_Y = 180;
const CHART_CENTER_Y = CHART_Y + CHART_SIZE / 2;

type Theme = {
  paperStops: Array<[offset: number, color: string]>;
  linear: boolean;
  frame: string;
  frameSoft: string;
  ink: string;
  accent: string;
  muted: string;
};

const THEMES: Record<PosterData['style'], Theme> = {
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
  },
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
  },
};

export type PosterFonts = { regular: string; bold: string };

export type PosterSvgOptions = {
  data: PosterData;
  labels: PosterLabels;
  /** Markup of the sky chart (an `<svg>` element) produced by SkyChart. */
  chartSvg: string;
  /** Base64 woff2 data so text renders identically on any device. Omit for a lighter file. */
  fonts?: PosterFonts;
  /** The small "آسمان شب ما" mark; the premium file leaves it out. */
  watermark: boolean;
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

function corner(color: string, x: number, y: number, sx: 1 | -1, sy: 1 | -1) {
  const k = 2.25; // the 20-unit icon becomes 45 units
  return `<g transform="translate(${x} ${y}) scale(${sx * k} ${sy * k}) translate(-1 -1)" fill="none" stroke="${color}" stroke-width="0.9"><path d="M1 19 V6 Q1 1 6 1 H19"/><circle cx="6" cy="6" r="1.3" fill="${color}" stroke="none"/></g>`;
}

export function buildPosterSvg(opts: PosterSvgOptions): string {
  const { data: p, labels: l, chartSvg, fonts, watermark } = opts;
  const t = THEMES[p.style];
  const W = POSTER_WIDTH;
  const H = POSTER_HEIGHT;
  const cx = W / 2;

  const text = (
    content: string,
    y: number,
    size: number,
    fill: string,
    weight: 400 | 700 = 400,
    extra = '',
  ) =>
    `<text x="${cx}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl" ${extra}>${esc(content)}</text>`;

  const parts: string[] = [];

  // eyebrow
  parts.push(text(l.headerLine, 94, 27, t.accent));

  // chart, glow and compass
  if (p.style === 'gold') {
    parts.push(
      `<circle cx="${cx}" cy="${CHART_CENTER_Y}" r="${CHART_SIZE * 0.56}" fill="url(#glow)"/>`,
    );
  }
  const compass = (s: string, x: number, y: number) =>
    text(s, y, 23, t.muted).replace(`x="${cx}"`, `x="${x}"`);
  parts.push(compass(l.north, cx, 158));
  parts.push(compass(l.south, cx, 790));
  parts.push(compass(l.east, 118, CHART_CENTER_Y + 8));
  parts.push(compass(l.west, W - 118, CHART_CENTER_Y + 8));
  parts.push(
    chartSvg.replace(
      '<svg ',
      `<svg x="${CHART_X}" y="${CHART_Y}" width="${CHART_SIZE}" height="${CHART_SIZE}" `,
    ),
  );

  // title block flows downwards from the chart
  let y = 880;
  const maxW = W - 2 * 81;
  for (const line of wrapText(p.title, 65, maxW, 0.56).slice(0, 2)) {
    parts.push(text(line, y, 65, t.ink, 700));
    y += 88;
  }
  y += 4;
  parts.push(text(p.names, y, 40, t.accent));
  y += 44;

  // divider
  const dy = y;
  parts.push(
    `<rect x="${cx - 190}" y="${dy - 0.6}" width="154" height="1.2" fill="url(#divL)"/>` +
      `<rect x="${cx + 36}" y="${dy - 0.6}" width="154" height="1.2" fill="url(#divR)"/>` +
      `<path transform="translate(${cx} ${dy}) scale(2.6)" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="${t.frame}"/>`,
  );
  y = dy + 66;

  for (const line of wrapText(p.quote, 32, maxW * 0.88).slice(0, 3)) {
    parts.push(text(line, y, 32, t.muted));
    y += 60;
  }

  // meta line pinned near the bottom
  const meta = [
    p.showCity ? p.city : null,
    p.showDate ? p.dateLabel : null,
    p.showDate && p.timeLabel ? `${l.timeAt} ${p.timeLabel}` : null,
  ].filter(Boolean);
  if (meta.length) parts.push(text(meta.join('   •   '), 1225, 28, t.ink));
  if (watermark) parts.push(text(l.watermark, 1274, 20, t.muted));

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
    `<radialGradient id="glow"><stop offset="0" stop-color="#CEB47B" stop-opacity="0.16"/><stop offset="1" stop-color="#CEB47B" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="divL" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}" stop-opacity="0"/><stop offset="1" stop-color="${t.frame}"/></linearGradient>` +
    `<linearGradient id="divR" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}"/><stop offset="1" stop-color="${t.frame}" stop-opacity="0"/></linearGradient>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#paper)"/>` +
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
