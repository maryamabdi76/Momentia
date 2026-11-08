import type { PosterFonts } from '../../poster/lib/poster-svg.ts';
import { toPersianDigits } from '../../poster/lib/digits.ts';
import { IRAN_CITIES } from '../../poster/lib/cities.ts';
import {
  createProjection,
  iranOutlinePath,
  smoothOpenPath,
  spreadPins,
  type Point,
} from './map-geometry.ts';

export const MAP_POSTER_WIDTH = 900;
export const MAP_POSTER_HEIGHT = 1350;
export const MIN_MILESTONES = 2;
export const MAX_MILESTONES = 8;

export type Milestone = { title: string; city: string; date: string };
export type TreasureMapData = { title: string; names: string; milestones: Milestone[] };
export type TreasureMapLabels = {
  kicker: string;
  /** "{count} لحظه" already filled in. */
  count: string;
  watermark: string;
  alt: string;
  gulf: string;
  caspian: string;
  north: string;
};
export type TreasureMapOptions = {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  fonts?: PosterFonts;
  /** The small site mark at the foot; the premium file leaves it out. */
  watermark: boolean;
  /** Prefix for ids, so several maps can share a page. */
  idPrefix?: string;
};

const GOLD = '#CEB47B';
const GOLD_SOFT = '#E8D9B8';
const INK = '#0c142b';
const TEXT = '#F4EFE6';
const MUTED = '#AAB6CD';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v: number) => Math.round(v * 10) / 10;

/** Milestones whose city we know, up to the maximum, each with its coordinates. */
export function placeMilestones(milestones: Milestone[]) {
  return milestones
    .slice(0, MAX_MILESTONES)
    .map((m) => ({ m, city: IRAN_CITIES.find((c) => c.name === m.city) }))
    .filter((x): x is { m: Milestone; city: (typeof IRAN_CITIES)[number] } => x.city !== undefined);
}

/** A title shrinks a little as it gets longer, so it stays on one line. */
export function titleFontSize(text: string): number {
  return Math.round(Math.max(40, Math.min(66, 740 / (Math.max(text.length, 1) * 0.56))));
}

export function buildTreasureMapSvg(opts: TreasureMapOptions): string {
  const { data, labels, fonts, watermark } = opts;
  const id = opts.idPrefix ?? 'tmap';
  const W = MAP_POSTER_WIDTH;
  const H = MAP_POSTER_HEIGHT;
  const box = { x: 80, y: 300, width: 740, height: 660 };
  const project = createProjection(box, 28);
  const placed = placeMilestones(data.milestones);
  const pins: Point[] = spreadPins(
    placed.map(({ city }) => project(city.lon, city.lat)),
    placed.map(({ city }) => city.name),
  );

  const parts: string[] = [];
  const text = (x: number, y: number, size: number, weight: number, fill: string, s: string, extra = '') =>
    `<text x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl"${extra}>${esc(s)}</text>`;

  // frame: a double hairline, like the page of an atlas
  parts.push(
    `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="6" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="2"/>`,
    `<rect x="44" y="44" width="${W - 88}" height="${H - 88}" rx="3" fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="1.5"/>`,
  );

  // heading
  parts.push(text(W / 2, 112, 24, 400, GOLD, labels.kicker, ' letter-spacing="1"'));
  parts.push(text(W / 2, 196, titleFontSize(data.title), 700, TEXT, data.title));
  if (data.names) parts.push(text(W / 2, 252, 30, 400, GOLD_SOFT, data.names));

  // the map panel
  parts.push(
    `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" fill="#0f1a38" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>`,
    `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" fill="url(#${id}-grid)"/>`,
  );
  const land = iranOutlinePath(project);
  parts.push(
    `<path d="${land}" fill="${GOLD}" fill-opacity="0.18" stroke="${GOLD}" stroke-width="6" stroke-opacity="0.25" stroke-linejoin="round" filter="url(#${id}-glow)"/>`,
    `<path d="${land}" fill="#1a2850" stroke="${GOLD}" stroke-opacity="0.8" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="${land}" fill="url(#${id}-hatch)"/>`,
  );

  // sea names, faint
  const gulf = project(52.2, 26.5);
  const caspian = project(51.2, 38.7);
  parts.push(
    text(gulf.x, gulf.y, 20, 400, MUTED, labels.gulf, ' fill-opacity="0.55" letter-spacing="2"'),
    text(caspian.x, caspian.y, 20, 400, MUTED, labels.caspian, ' fill-opacity="0.55" letter-spacing="2"'),
  );

  // the route, then the pins on top of it
  if (pins.length >= 2) {
    parts.push(
      `<path d="${smoothOpenPath(pins)}" fill="none" stroke="${GOLD}" stroke-width="3.5" stroke-dasharray="2 11" stroke-linecap="round"/>`,
    );
  }
  pins.forEach((p, i) => {
    parts.push(
      `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="22" fill="${GOLD}" fill-opacity="0.16"/>`,
      `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="15" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>`,
      text(p.x, p.y + 6.5, 18, 700, INK, toPersianDigits(String(i + 1))),
    );
  });

  // compass rose, bottom-start corner of the panel
  const cx = box.x + box.width - 62;
  const cy = box.y + box.height - 66;
  parts.push(
    `<g transform="translate(${cx} ${cy})"><circle r="34" fill="none" stroke="${GOLD}" stroke-opacity="0.5"/>` +
      `<path d="M0 -32L7 -7L32 0L7 7L0 32L-7 7L-32 0L-7 -7Z" fill="${GOLD}" fill-opacity="0.85"/>` +
      `<text y="-42" font-size="18" font-weight="700" fill="${GOLD_SOFT}" text-anchor="middle">${esc(labels.north)}</text></g>`,
  );

  // legend: two columns, the first milestone at the right (reading order of Persian)
  const rows = Math.ceil(placed.length / 2);
  const rowH = 64;
  const legendTop = 1020 + (4 - Math.min(rows, 4)) * (rowH / 2);
  placed.forEach(({ m, city }, i) => {
    const col = i % 2; // 0 = right column
    const row = Math.floor(i / 2);
    const right = col === 0 ? 820 : 450 - 24;
    const y = legendTop + row * rowH;
    const textCx = right - 22 - 160;
    parts.push(
      `<circle cx="${right - 14}" cy="${y + 14}" r="14" fill="${GOLD}"/>`,
      text(right - 14, y + 20, 16, 700, INK, toPersianDigits(String(i + 1))),
      text(textCx, y + 12, 25, 700, TEXT, m.title),
      text(textCx, y + 42, 19, 400, MUTED, toPersianDigits([city.name, m.date].filter(Boolean).join(' · '))),
    );
  });

  // footer
  parts.push(text(W / 2, 1268, 20, 400, MUTED, labels.count));
  if (watermark) parts.push(text(W / 2, 1306, 18, 400, GOLD, labels.watermark, ' fill-opacity="0.8"'));

  const fontCss = fonts
    ? `@font-face{font-family:'Vazirmatn';font-weight:400;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2')}` +
      `@font-face{font-family:'Vazirmatn';font-weight:700;src:url(data:font/woff2;base64,${fonts.bold}) format('woff2')}`
    : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(labels.alt)}">` +
    `<defs><style>${fontCss}text{font-family:'Vazirmatn',Tahoma,sans-serif}</style>` +
    `<radialGradient id="${id}-bg" gradientUnits="userSpaceOnUse" cx="${W / 2}" cy="0" r="${H * 0.95}" gradientTransform="translate(${W / 2} 0) scale(1.2 1) translate(${-W / 2} 0)"><stop offset="0" stop-color="#1b2a58"/><stop offset="0.62" stop-color="${INK}"/></radialGradient>` +
    `<filter id="${id}-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>` +
    `<pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${GOLD}" stroke-opacity="0.07"/></pattern>` +
    `<pattern id="${id}-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="9" stroke="${GOLD}" stroke-opacity="0.13"/></pattern>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>` +
    parts.join('') +
    `</svg>`
  );
}
