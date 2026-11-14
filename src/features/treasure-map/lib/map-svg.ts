import type { PosterFonts } from '../../poster/lib/poster-svg.ts';
import { formatDecimal, toPersianDigits } from '../../poster/lib/digits.ts';
import { IRAN_CITIES } from '../../poster/lib/cities.ts';
import { IRAN_OUTLINE } from './iran-outline.ts';
import { frameSvg, type PosterFrame } from '../../poster/lib/frames.ts';
import { mulberry32 } from '../../moon/lib/random.ts';
import { frameView, projectToPoster } from './mercator.ts';
import { tilesFor, type TileSpec } from './tiles.ts';
import {
  smoothClosedPath,
  smoothOpenPath,
  spreadPins,
  type Point,
} from './map-geometry.ts';

export const MAP_POSTER_WIDTH = 900;
export const MAP_POSTER_HEIGHT = 1350;
export const MIN_MILESTONES = 2;
export const MAX_MILESTONES = 8;
/** Radius of the circle / heart a city map is cut to, in poster pixels. */
export const MAP_RADIUS = 296;

export const MAP_SCOPES = ['city', 'iran'] as const;
export type MapScope = (typeof MAP_SCOPES)[number];
export const MAP_THEMES = ['paper', 'blush', 'night'] as const;
export const MAP_SHAPES = ['circle', 'heart'] as const;
export type MapShape = (typeof MAP_SHAPES)[number];
export type MapTheme = (typeof MAP_THEMES)[number];

/** `city` is a place name in the chosen city (city map) or an Iranian city (Iran map). */
export type Milestone = { title: string; city: string; date: string; lat?: number; lon?: number };
export type TreasureMapData = {
  title: string;
  names: string;
  scope: MapScope;
  /** The city a city map is drawn for. */
  area: string;
  theme: MapTheme;
  /** The cut of a city map. */
  shape: MapShape;
  /** The border around the poster. */
  frame: PosterFrame;
  milestones: Milestone[];
};
export type TreasureMapLabels = {
  kicker: string;
  /** "{count} لحظه" already filled in. */
  count: string;
  watermark: string;
  /** Credit for the map data, shown when a real map is drawn. */
  credit: string;
  alt: string;
  north: string;
  iran: string;
};
export type TreasureMapOptions = {
  data: TreasureMapData;
  labels: TreasureMapLabels;
  fonts?: PosterFonts;
  /** Tile pictures as data: URIs, by tile URL, so an exported file stands on its own. */
  tileImages?: Record<string, string>;
  /** The small site mark at the foot; the premium file leaves it out. */
  watermark: boolean;
  /** Prefix for ids, so several maps can share a page. */
  idPrefix?: string;
};

const PALETTES = {
  // warm paper, charcoal ink and one clay-rose accent: the look of printed love-story maps
  paper: { bg: '#F6F0E4', card: '#FBF8F1', ink: '#2A2733', accent: '#B4513C', muted: '#7A7684', land: '#EFE6D5', water: '#C9DADD', park: '#D8E1CC', onAccent: '#FFFFFF' },
  blush: { bg: '#F7E9E5', card: '#FCF4F1', ink: '#3A2A2E', accent: '#A8324A', muted: '#8A7479', land: '#F0DAD5', water: '#E0CFD2', park: '#E6D9CF', onAccent: '#FFFFFF' },
  night: { bg: '#0c142b', card: '#101a38', ink: '#F4EFE6', accent: '#CEB47B', muted: '#AAB6CD', land: '#1a2850', water: '#1a2d5e', park: '#142447', onAccent: '#0c142b' },
} as const;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v: number) => Math.round(v * 10) / 10;

/** A title shrinks a little as it gets longer, so it stays on one line. */
export function titleFontSize(text: string): number {
  return Math.round(Math.max(40, Math.min(66, 740 / (Math.max(text.length, 1) * 0.56))));
}

const hash = (s: string) => [...s].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

type Pal = (typeof PALETTES)[MapTheme];

/** The map's paper colour, for the page behind the poster in story/wallpaper/print files. */
export function mapPaperColor(theme: MapTheme): string {
  return PALETTES[theme].bg;
}

/** Border colours for a theme: the ink, and the same ink at half strength. */
export function mapFrameColors(theme: MapTheme): { frame: string; frameSoft: string } {
  const { ink } = PALETTES[theme];
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(ink.slice(i, i + 2), 16));
  return { frame: ink, frameSoft: `rgba(${r},${g},${b},0.45)` };
}

/** A heart, `s` wide on each side of `cx`, as an absolute path. */
export function heartPath(cx: number, cy: number, s: number): string {
  const P = (x: number, y: number) => `${n(cx + x * s)} ${n(cy + y * s)}`;
  return (
    `M${P(0, 0.95)}C${P(-0.15, 0.8)} ${P(-1, 0.25)} ${P(-1, -0.3)}` +
    `C${P(-1, -0.75)} ${P(-0.65, -1)} ${P(-0.35, -1)}C${P(-0.15, -1)} ${P(-0.03, -0.9)} ${P(0, -0.75)}` +
    `C${P(0.03, -0.9)} ${P(0.15, -1)} ${P(0.35, -1)}C${P(0.65, -1)} ${P(1, -0.75)} ${P(1, -0.3)}` +
    `C${P(1, 0.25)} ${P(0.15, 0.8)} ${P(0, 0.95)}Z`
  );
}

/** A city block grid, with some blocks left open, in local coordinates (rotate it with a transform). */
function blockGrid(rnd: () => number, extent: number, sx: number, sy: number, drop: number): string {
  let d = '';
  const run = (x0: number, y0: number, x1: number, y1: number, steps: number) => {
    let open = false;
    for (let i = 0; i < steps; i++) {
      const keep = rnd() > drop;
      const ax = x0 + ((x1 - x0) * i) / steps;
      const ay = y0 + ((y1 - y0) * i) / steps;
      const bx = x0 + ((x1 - x0) * (i + 1)) / steps;
      const by = y0 + ((y1 - y0) * (i + 1)) / steps;
      if (keep) {
        d += open ? `L${n(bx)} ${n(by)}` : `M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}`;
        open = true;
      } else open = false;
    }
  };
  for (let y = -extent; y <= extent; y += sy) run(-extent, y, extent, y, Math.round((extent * 2) / sx));
  for (let x = -extent; x <= extent; x += sx) run(x, -extent, x, extent, Math.round((extent * 2) / sy));
  return d;
}

/** A closed, rounded blob around (cx, cy), for parks. */
function blob(rnd: () => number, cx: number, cy: number, r: number): string {
  const pts: Point[] = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const rr = r * (0.7 + rnd() * 0.5);
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.8 };
  });
  return smoothClosedPath(pts);
}

/**
 * A stylised street map: two districts of blocks at different angles, avenues, a
 * river and a few parks, drawn the same way every time for the same city. It is a
 * mood, not a survey.
 */
function cityBackdrop(c: { cx: number; cy: number; r: number }, seed: string, p: Pal, id: string) {
  const rnd = mulberry32(hash(seed));
  const { cx, cy, r } = c;
  const a1 = -20 + rnd() * 40;
  const a2 = a1 + 28 + rnd() * 24;
  const out: string[] = [];
  const street = `fill="none" stroke="${p.ink}" stroke-linecap="round"`;
  out.push(
    `<g transform="translate(${cx} ${cy}) rotate(${n(a1)})"><path d="${blockGrid(rnd, r * 1.5, 30, 24, 0.2)}" ${street} stroke-opacity="0.34" stroke-width="1.3"/></g>`,
  );
  // a second district at another angle, on its own patch of paper
  const dx = (rnd() - 0.5) * r * 0.9;
  const dy = (rnd() - 0.5) * r * 0.7;
  out.push(
    `<clipPath id="${id}-d2"><ellipse cx="${n(cx + dx)}" cy="${n(cy + dy)}" rx="${n(r * 0.5)}" ry="${n(r * 0.38)}" transform="rotate(${n(a2)} ${n(cx + dx)} ${n(cy + dy)})"/></clipPath>` +
      `<g clip-path="url(#${id}-d2)"><rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${p.card}"/>` +
      `<g transform="translate(${n(cx + dx)} ${n(cy + dy)}) rotate(${n(a2)})"><path d="${blockGrid(rnd, r, 40, 30, 0.28)}" ${street} stroke-opacity="0.34" stroke-width="1.3"/></g></g>`,
  );
  // avenues
  for (let i = 0; i < 4; i++) {
    const t = (i + rnd() * 0.6) / 4;
    const ang = rnd() * Math.PI;
    const x0 = cx + Math.cos(ang) * r * 1.3;
    const y0 = cy + Math.sin(ang) * r * 1.3;
    const x1 = cx - Math.cos(ang) * r * 1.3;
    const y1 = cy - Math.sin(ang) * r * 1.3;
    const bend = (rnd() - 0.5) * r * 0.5;
    out.push(
      `<path d="M${n(x0)} ${n(y0)}Q${n(cx + (t - 0.5) * r * 0.5 + bend)} ${n(cy + bend)} ${n(x1)} ${n(y1)}" ${street} stroke-opacity="0.55" stroke-width="3.2"/>`,
    );
  }
  // parks
  for (let i = 0; i < 3; i++) {
    const bx = cx + (rnd() - 0.5) * r * 1.3;
    const by = cy + (rnd() - 0.5) * r * 1.1;
    out.push(`<path d="${blob(rnd, bx, by, r * (0.1 + rnd() * 0.07))}" fill="${p.park}" stroke="${p.card}" stroke-width="3"/>`);
  }
  // the river cuts through everything
  const ry = cy + (rnd() - 0.5) * r * 0.9;
  const river = `M${n(cx - r * 1.4)} ${n(ry + (rnd() - 0.5) * r * 0.5)}C${n(cx - r * 0.5)} ${n(ry - r * 0.5)} ${n(cx + r * 0.3)} ${n(ry + r * 0.5)} ${n(cx + r * 1.4)} ${n(ry + (rnd() - 0.5) * r * 0.5)}`;
  out.push(
    `<path d="${river}" fill="none" stroke="${p.card}" stroke-width="40" stroke-linecap="round"/>`,
    `<path d="${river}" fill="none" stroke="${p.water}" stroke-width="28" stroke-linecap="round"/>`,
  );
  return out.join('');
}

const hasPoint = (m: Milestone): m is Milestone & { lat: number; lon: number } =>
  typeof m.lat === 'number' && typeof m.lon === 'number';

const picked = (ms: Milestone[]) => ms.filter(hasPoint);

/** Iran as one fixed view: the whole country fits the panel with a margin. */
const IRAN_VIEW = { center: { lon: 53.75, lat: 32.4 }, metresPerPx: 3100 };
const IRAN_PANEL = { x: 90, y: 300, width: 720, height: 620 };

/** The tiles a map needs: always for Iran, and for a city once all its places are picked. */
export function mapTiles(data: TreasureMapData): TileSpec[] {
  const style = data.theme === 'night' ? 'dark' : 'light';
  if (data.scope === 'iran') {
    const c = { x: IRAN_PANEL.x + IRAN_PANEL.width / 2, y: IRAN_PANEL.y + IRAN_PANEL.height / 2 };
    return tilesFor(IRAN_VIEW, c, { x: IRAN_PANEL.width / 2, y: IRAN_PANEL.height / 2 }, style);
  }
  const items = data.milestones.slice(0, MAX_MILESTONES);
  const pts = picked(items);
  if (pts.length === 0 || pts.length !== items.length) return [];
  const view = frameView(pts.map((m) => ({ lon: m.lon, lat: m.lat })), MAP_RADIUS);
  const heart = data.shape === 'heart';
  return tilesFor(view, { x: MAP_POSTER_WIDTH / 2, y: heart ? 618 : 610 }, MAP_RADIUS, style);
}

/** Points wandering from right to left across the middle of the shape (Persian reads right to left). */
function cityPins(c: { cx: number; cy: number; r: number }, count: number, seed: string): Point[] {
  const rnd = mulberry32(hash(seed) ^ 0x9e3779b9);
  const phase = rnd() * Math.PI;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return {
      x: c.cx + (0.5 - t) * c.r * 1.05,
      y: c.cy + Math.sin(t * Math.PI * 1.7 + phase) * c.r * 0.28 + (rnd() - 0.5) * c.r * 0.08,
    };
  });
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/**
 * Washes the standard map down to one soft tone: roads vanish into the paper, outlines and
 * labels become a faint line drawing. The tile's brightness becomes the strength of the ink.
 */
function tintFilter(id: string, theme: MapTheme): string {
  const p = PALETTES[theme];
  const W = [0.2126, 0.7152, 0.0722];
  const ink = 0.55;
  const rows = rgb(p.card).map((paper, i) => {
    if (theme === 'night') {
      // dark paper, light ink: darkest tile pixels become the strongest line
      const line = rgb(p.ink)[i]!;
      const k = (line - paper) * ink;
      return [-k * W[0]!, -k * W[1]!, -k * W[2]!, 0, paper + k];
    }
    const a = paper * ink;
    return [a * W[0]!, a * W[1]!, a * W[2]!, 0, paper * (1 - ink)];
  });
  const values = [...rows, [0, 0, 0, 1, 0]].map((r) => r.map((v) => +v.toFixed(4)).join(' ')).join('  ');
  return `<filter id="${id}-tint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${values}"/></filter>`;
}

/** The outline of Iran as a smooth closed path, in the same projection as the tiles. */
function iranSilhouette(centre: { x: number; y: number }): string {
  return smoothClosedPath(
    // every other point: a softer silhouette, not a survey
    IRAN_OUTLINE.filter((_, i) => i % 2 === 0).map(([lon, lat]) => projectToPoster({ lon, lat }, IRAN_VIEW, centre)),
  );
}

export function buildTreasureMapSvg(opts: TreasureMapOptions): string {
  const { data, labels, fonts, watermark, tileImages } = opts;
  const id = opts.idPrefix ?? 'tmap';
  const p = PALETTES[data.theme];
  const W = MAP_POSTER_WIDTH;
  const H = MAP_POSTER_HEIGHT;
  const isCity = data.scope === 'city';
  const heart = data.shape === 'heart';
  // a city map is cut to a circle or a heart; an Iran map is cut to Iran's outline
  const R = MAP_RADIUS;
  const shape = { cx: W / 2, cy: heart ? 618 : 610, r: R };
  const panel = IRAN_PANEL;
  const panelCentre = { x: panel.x + panel.width / 2, y: panel.y + panel.height / 2 };

  const items = data.milestones.slice(0, MAX_MILESTONES).map((m) => ({ m }));
  const parts: string[] = [];
  const text = (x: number, y: number, size: number, weight: number, fill: string, s: string, extra = '') =>
    `<text x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl"${extra}>${esc(s)}</text>`;

  // the chosen border (none draws nothing)
  parts.push(frameSvg(data.frame, mapFrameColors(data.theme), W, H));

  // heading (no letter-spacing: it breaks the joined Persian letters)
  parts.push(text(W / 2, 114, 22, 400, p.accent, labels.kicker));
  parts.push(text(W / 2, 196, titleFontSize(data.title), 700, p.ink, data.title));
  if (data.names) parts.push(text(W / 2, 250, 28, 400, p.muted, data.names));

  const pts = picked(items.map((x) => x.m));
  const real = pts.length === items.length && pts.length > 0;
  const tiles = mapTiles(data);
  const tileMarkup = tiles
    .map((t) => `<image href="${esc(tileImages?.[t.url] ?? t.url)}" x="${n(t.left - 0.4)}" y="${n(t.top - 0.4)}" width="${n(t.size + 0.8)}" height="${n(t.size + 0.8)}" preserveAspectRatio="none"/>`)
    .join('');
  const tinted = tileMarkup ? `<g filter="url(#${id}-tint)">${tileMarkup}</g>` : '';

  let pins: Point[] = [];
  let coords = '';
  let usedTiles = false;
  if (isCity) {
    const shapePath = heart ? heartPath(shape.cx, shape.cy, R) : '';
    const clip = heart ? `<path d="${shapePath}"/>` : `<circle cx="${shape.cx}" cy="${shape.cy}" r="${R}"/>`;
    parts.push(`<clipPath id="${id}-clip">${clip}</clipPath>`);
    parts.push(heart ? `<path d="${shapePath}" fill="${p.card}"/>` : `<circle cx="${shape.cx}" cy="${shape.cy}" r="${R}" fill="${p.card}"/>`);
    const view = real ? frameView(pts.map((m) => ({ lon: m.lon, lat: m.lat })), R) : null;
    parts.push(`<g clip-path="url(#${id}-clip)">${real ? tinted : cityBackdrop(shape, data.area, p, id)}</g>`);
    usedTiles = real;
    // outline, with a fine second ring on a circle
    if (heart) {
      parts.push(`<path d="${shapePath}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-linejoin="round"/>`);
    } else {
      parts.push(
        `<circle cx="${shape.cx}" cy="${shape.cy}" r="${R}" fill="none" stroke="${p.ink}" stroke-width="3"/>`,
        `<circle cx="${shape.cx}" cy="${shape.cy}" r="${R + 14}" fill="none" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="1.2"/>`,
      );
    }
    if (view) {
      pins = items.map(({ m }) => projectToPoster({ lon: m.lon ?? 0, lat: m.lat ?? 0 }, view, { x: shape.cx, y: shape.cy }));
      coords = toPersianDigits(`${formatDecimal(view.center.lat, 2)}°N · ${formatDecimal(view.center.lon, 2)}°E`);
    } else {
      pins = cityPins({ ...shape, cy: heart ? shape.cy - 40 : shape.cy }, items.length, data.area + data.title);
      const c = IRAN_CITIES.find((x) => x.name === data.area);
      if (c) coords = toPersianDigits(`${formatDecimal(c.lat, 2)}°N · ${formatDecimal(c.lon, 2)}°E`);
    }
  } else {
    // Iran: the map shows through Iran's outline only; everything beyond the border stays paper
    const outline = iranSilhouette(panelCentre);
    parts.push(`<clipPath id="${id}-clip"><path d="${outline}"/></clipPath>`);
    parts.push(`<path d="${outline}" fill="${p.card}"/>`);
    parts.push(`<g clip-path="url(#${id}-clip)">${tinted}</g>`);
    parts.push(`<path d="${outline}" fill="none" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="2" stroke-linejoin="round"/>`);
    usedTiles = tiles.length > 0;
    if (real) {
      const placed = pts.map((m) => projectToPoster({ lon: m.lon, lat: m.lat }, IRAN_VIEW, panelCentre));
      pins = spreadPins(placed, pts.map((m) => `${m.lat.toFixed(2)},${m.lon.toFixed(2)}`), 16);
    }
  }

  if (pins.length >= 2) {
    parts.push(`<path d="${smoothOpenPath(pins)}" fill="none" stroke="${p.accent}" stroke-width="3.2" stroke-dasharray="1 10" stroke-linecap="round"/>`);
  }
  pins.forEach((pt, i) => {
    parts.push(
      `<circle cx="${n(pt.x)}" cy="${n(pt.y)}" r="24" fill="${p.accent}" fill-opacity="0.18"/>`,
      `<circle cx="${n(pt.x)}" cy="${n(pt.y)}" r="15" fill="${p.accent}" stroke="${p.card}" stroke-width="3"/>`,
      text(pt.x, pt.y + 6, 17, 700, p.onAccent, toPersianDigits(String(i + 1))),
    );
  });

  // the place under the map, as on printed maps
  parts.push(text(W / 2, 958, 34, 700, p.ink, isCity ? data.area : labels.iran));
  if (coords) parts.push(text(W / 2, 988, 17, 400, p.muted, coords));

  // legend: two columns, the first milestone at the right (reading order of Persian)
  const rows = Math.ceil(items.length / 2);
  const rowH = 60;
  const legendTop = 1032 + (4 - Math.min(rows, 4)) * (rowH / 2);
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
      text(textCx, y + 40, 17, 400, p.muted, toPersianDigits([m.city, m.date].filter(Boolean).join(' · '))),
    );
  });

  if (usedTiles) parts.push(text(W / 2, 1272, 14, 400, p.muted, labels.credit));
  if (watermark) parts.push(text(W / 2, 1296, 17, 400, p.accent, labels.watermark, ' fill-opacity="0.85"'));

  const fontCss = fonts
    ? `@font-face{font-family:'Vazirmatn';font-weight:400;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2')}` +
      `@font-face{font-family:'Vazirmatn';font-weight:700;src:url(data:font/woff2;base64,${fonts.bold}) format('woff2')}`
    : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(labels.alt)}">` +
    `<defs><style>${fontCss}text{font-family:'Vazirmatn',Tahoma,sans-serif}</style>${tintFilter(id, data.theme)}</defs>` +
    `<rect width="${W}" height="${H}" fill="${p.bg}"/>` +
    parts.join('') +
    `</svg>`
  );
}
