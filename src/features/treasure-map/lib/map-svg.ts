import type { PosterFonts } from '../../poster/lib/poster-svg.ts';
import { formatDecimal, toPersianDigits } from '../../poster/lib/digits.ts';
import { IRAN_CITIES } from '../../poster/lib/cities.ts';
import { mulberry32 } from '../../moon/lib/random.ts';
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

export const MAP_SCOPES = ['city', 'iran'] as const;
export type MapScope = (typeof MAP_SCOPES)[number];
export const MAP_THEMES = ['paper', 'night'] as const;
export type MapTheme = (typeof MAP_THEMES)[number];

/** `city` is a place name in the chosen city (city map) or an Iranian city (Iran map). */
export type Milestone = { title: string; city: string; date: string };
export type TreasureMapData = {
  title: string;
  names: string;
  scope: MapScope;
  /** The city a city map is drawn for. */
  area: string;
  theme: MapTheme;
  milestones: Milestone[];
};
export type TreasureMapLabels = {
  kicker: string;
  /** "{count} لحظه" already filled in. */
  count: string;
  watermark: string;
  alt: string;
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

const PALETTES = {
  // warm paper, charcoal ink and one rose-clay accent: the look of printed love-story maps
  paper: { bg: '#F7F2E8', ink: '#2A2733', accent: '#B4513C', muted: '#7A7684', land: '#EFE6D5', water: '#D6E2E4', onAccent: '#FFFFFF' },
  night: { bg: '#0c142b', ink: '#F4EFE6', accent: '#CEB47B', muted: '#AAB6CD', land: '#1a2850', water: '#13204a', onAccent: '#0c142b' },
} as const;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v: number) => Math.round(v * 10) / 10;

/** Milestones of an Iran map whose city we know, up to the maximum, each with its coordinates. */
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

const hash = (s: string) => [...s].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

/**
 * An abstract street map: a river, a ring road and a few avenues, drawn the same way
 * every time for the same city. It is a mood, not a survey.
 */
function cityBackdrop(box: { x: number; y: number; width: number; height: number }, seed: string, p: (typeof PALETTES)[MapTheme]) {
  const rnd = mulberry32(hash(seed));
  const { x, y, width: w, height: h } = box;
  const at = (fx: number, fy: number) => `${n(x + fx * w)} ${n(y + fy * h)}`;
  const out: string[] = [];
  // river
  const r0 = 0.25 + rnd() * 0.5;
  out.push(
    `<path d="M${at(-0.05, r0)} C${at(0.3, r0 - 0.25 + rnd() * 0.2)} ${at(0.55, r0 + 0.25 - rnd() * 0.2)} ${at(1.05, r0 + (rnd() - 0.5) * 0.3)}" fill="none" stroke="${p.water}" stroke-width="30" stroke-linecap="round"/>`,
  );
  // ring road
  out.push(
    `<ellipse cx="${n(x + w * (0.45 + rnd() * 0.1))}" cy="${n(y + h * (0.45 + rnd() * 0.1))}" rx="${n(w * 0.3)}" ry="${n(h * 0.27)}" fill="none" stroke="${p.ink}" stroke-opacity="0.16" stroke-width="3"/>`,
  );
  // avenues and streets
  for (let i = 0; i < 11; i++) {
    const major = i < 4;
    const horizontal = i % 2 === 0;
    const a = rnd();
    const b = rnd();
    const d = horizontal
      ? `M${at(-0.05, a)} C${at(0.3, a + (rnd() - 0.5) * 0.12)} ${at(0.7, b + (rnd() - 0.5) * 0.12)} ${at(1.05, b)}`
      : `M${at(a, -0.05)} C${at(a + (rnd() - 0.5) * 0.12, 0.3)} ${at(b + (rnd() - 0.5) * 0.12, 0.7)} ${at(b, 1.05)}`;
    out.push(
      `<path d="${d}" fill="none" stroke="${p.ink}" stroke-opacity="${major ? 0.17 : 0.08}" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round"/>`,
    );
  }
  return out.join('');
}

/** n points spread across the map panel, left to right (right to left for Persian), wandering up and down. */
function cityPins(box: { x: number; y: number; width: number; height: number }, count: number, seed: string): Point[] {
  const rnd = mulberry32(hash(seed) ^ 0x9e3779b9);
  const pad = 70;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return {
      x: box.x + box.width - pad - t * (box.width - pad * 2),
      y: box.y + pad + (0.1 + 0.8 * (i % 2 === 0 ? rnd() * 0.5 : 0.5 + rnd() * 0.5)) * (box.height - pad * 2),
    };
  });
}

export function buildTreasureMapSvg(opts: TreasureMapOptions): string {
  const { data, labels, fonts, watermark } = opts;
  const id = opts.idPrefix ?? 'tmap';
  const p = PALETTES[data.theme];
  const W = MAP_POSTER_WIDTH;
  const H = MAP_POSTER_HEIGHT;
  const box = { x: 90, y: 300, width: 720, height: 640 };

  const items = data.milestones.slice(0, MAX_MILESTONES).map((m) => ({ m, city: IRAN_CITIES.find((c) => c.name === m.city) }));
  const parts: string[] = [];
  const text = (x: number, y: number, size: number, weight: number, fill: string, s: string, extra = '') =>
    `<text x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl"${extra}>${esc(s)}</text>`;

  // a single thin frame, like a matted print
  parts.push(
    `<rect x="36" y="36" width="${W - 72}" height="${H - 72}" fill="none" stroke="${p.ink}" stroke-opacity="0.55" stroke-width="2"/>`,
  );

  // heading
  parts.push(text(W / 2, 118, 22, 400, p.accent, labels.kicker, ' letter-spacing="1"'));
  parts.push(text(W / 2, 200, titleFontSize(data.title), 700, p.ink, data.title));
  if (data.names) parts.push(text(W / 2, 256, 28, 400, p.muted, data.names));

  // the map panel
  parts.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="${data.theme === 'paper' ? '#FBF8F1' : '#0f1a38'}" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="1.5"/>`);
  parts.push(`<g clip-path="url(#${id}-clip)">`);

  let pins: Point[];
  let coords = '';
  if (data.scope === 'iran') {
    // minimal: a soft silhouette, no sea names, no grid
    const project = createProjection(box, 40);
    const land = iranOutlinePath(project);
    parts.push(`<path d="${land}" fill="${p.land}" stroke="${p.ink}" stroke-opacity="0.45" stroke-width="1.8" stroke-linejoin="round"/>`);
    const placed = items.filter((x): x is { m: Milestone; city: (typeof IRAN_CITIES)[number] } => x.city !== undefined);
    pins = spreadPins(
      placed.map(({ city }) => project(city.lon, city.lat)),
      placed.map(({ city }) => city.name),
    );
  } else {
    parts.push(cityBackdrop(box, data.area, p));
    pins = cityPins(box, items.length, data.area + data.title);
    const c = IRAN_CITIES.find((x) => x.name === data.area);
    if (c) coords = toPersianDigits(`${formatDecimal(c.lat, 2)}°N · ${formatDecimal(c.lon, 2)}°E`);
  }

  if (pins.length >= 2) {
    parts.push(
      `<path d="${smoothOpenPath(pins)}" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>`,
    );
  }
  pins.forEach((pt, i) => {
    parts.push(
      `<circle cx="${n(pt.x)}" cy="${n(pt.y)}" r="23" fill="${p.accent}" fill-opacity="0.16"/>`,
      `<circle cx="${n(pt.x)}" cy="${n(pt.y)}" r="15" fill="${p.accent}" stroke="${data.theme === 'paper' ? '#FBF8F1' : p.bg}" stroke-width="3"/>`,
      text(pt.x, pt.y + 6, 17, 700, p.onAccent, toPersianDigits(String(i + 1))),
    );
  });
  parts.push('</g>');

  // place name and coordinates on a card in the panel's corner, as on printed maps
  const area = data.scope === 'city' ? data.area : '';
  if (area) {
    parts.push(
      `<rect x="${box.x + 20}" y="${box.y + box.height - 92}" width="260" height="72" fill="${data.theme === 'paper' ? '#FBF8F1' : p.bg}" stroke="${p.ink}" stroke-opacity="0.35"/>`,
      text(box.x + 150, box.y + box.height - 54, 28, 700, p.ink, area),
      coords ? text(box.x + 150, box.y + box.height - 30, 15, 400, p.muted, coords) : '',
    );
  }
  parts.push(
    `<g transform="translate(${box.x + box.width - 44} ${box.y + 52})"><circle r="26" fill="none" stroke="${p.ink}" stroke-opacity="0.35"/><path d="M0 -24L5 -4L0 0L-5 -4Z" fill="${p.accent}"/><path d="M0 24L5 4L0 0L-5 4Z" fill="${p.ink}" fill-opacity="0.35"/><text y="-32" font-size="16" font-weight="700" fill="${p.muted}" text-anchor="middle">${esc(labels.north)}</text></g>`,
  );

  // legend: two columns, the first milestone at the right (reading order of Persian)
  const rows = Math.ceil(items.length / 2);
  const rowH = 64;
  const legendTop = 1000 + (4 - Math.min(rows, 4)) * (rowH / 2);
  items.forEach(({ m }, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const right = col === 0 ? 810 : 450 - 20;
    const y = legendTop + row * rowH;
    const textCx = right - 22 - 160;
    parts.push(
      `<circle cx="${right - 14}" cy="${y + 14}" r="14" fill="${p.accent}"/>`,
      text(right - 14, y + 20, 15, 700, p.onAccent, toPersianDigits(String(i + 1))),
      text(textCx, y + 12, 24, 700, p.ink, m.title),
      text(textCx, y + 42, 18, 400, p.muted, toPersianDigits([m.city, m.date].filter(Boolean).join(' · '))),
    );
  });

  parts.push(text(W / 2, 1262, 19, 400, p.muted, labels.count));
  if (watermark) parts.push(text(W / 2, 1298, 17, 400, p.accent, labels.watermark, ' fill-opacity="0.85"'));

  const fontCss = fonts
    ? `@font-face{font-family:'Vazirmatn';font-weight:400;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2')}` +
      `@font-face{font-family:'Vazirmatn';font-weight:700;src:url(data:font/woff2;base64,${fonts.bold}) format('woff2')}`
    : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(labels.alt)}">` +
    `<defs><style>${fontCss}text{font-family:'Vazirmatn',Tahoma,sans-serif}</style>` +
    `<clipPath id="${id}-clip"><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}"/></clipPath></defs>` +
    `<rect width="${W}" height="${H}" fill="${p.bg}"/>` +
    parts.join('') +
    `</svg>`
  );
}
