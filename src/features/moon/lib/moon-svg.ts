import { POSTER_THEMES, type PosterStyle } from '../../poster/lib/themes.ts';
import { wrapText, type PosterFonts } from '../../poster/lib/poster-svg.ts';
import { MOON_PALETTES } from './palettes.ts';
import { litPath, moonRotation } from './phase.ts';
import { mulberry32 } from './random.ts';

/**
 * The Moon poster as one self-contained SVG string. The on-screen preview and
 * every file we hand out (SVG, PNG, share) are this same markup, laid out on a
 * 900 × 1350 canvas.
 */
export const MOON_POSTER_WIDTH = 900;
export const MOON_POSTER_HEIGHT = 1350;

const MOON_X = 450;
const MOON_Y = 520;
export const MOON_RADIUS = 280;

/** The near side of the Moon as a photograph-style disc (see public/moon). */
export const MOON_IMAGE_URL = '/moon/moon-nearside.jpg';

export type MoonPosterData = {
  title: string;
  names: string;
  quote: string;
  style: PosterStyle;
  showDate: boolean;
  showCity: boolean;
  /** The phase name and how much of the disc is lit, under the Moon. */
  showDetails: boolean;
  /** Faint background stars. */
  showStars: boolean;
  city: string;
  dateLabel: string;
  timeLabel: string;
};

/** What the Moon looked like at that moment. */
export type MoonFacts = {
  /** 0 (new) … 1 (full) */
  illumination: number;
  waxing: boolean;
  /** Decides whether the Moon is drawn upside down. */
  latitude: number;
  /** Already worded, e.g. "هلال نوین · ۱۲٪ روشن". */
  phaseLine: string;
};

export type MoonLabels = {
  headerLine: string;
  watermark: string;
  timeAt: string;
  mapAlt: string;
};

export type MoonSvgOptions = {
  data: MoonPosterData;
  facts: MoonFacts;
  labels: MoonLabels;
  fonts?: PosterFonts;
  /** The small "آسمان شب ما" mark; the premium file leaves it out. */
  watermark: boolean;
  /** Where the photograph of the Moon is loaded from; exports pass an embedded data: URI. */
  imageHref?: string;
  /** Prefix for gradient/filter ids, so several posters can share one page. */
  idPrefix?: string;
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const n = (v: number) => Math.round(v * 100) / 100;

/** A disc slightly larger than the Moon, so blurring the shadow never lightens the dark limb. */
function shadowDisc(r: number) {
  return `M${n(-r)} 0A${n(r)} ${n(r)} 0 1 0 ${n(r)} 0A${n(r)} ${n(r)} 0 1 0 ${n(-r)} 0Z`;
}

function corner(color: string, x: number, y: number, sx: 1 | -1, sy: 1 | -1) {
  const k = 2.25;
  return `<g transform="translate(${x} ${y}) scale(${sx * k} ${sy * k}) translate(-1 -1)" fill="none" stroke="${color}" stroke-width="0.9"><path d="M1 19 V6 Q1 1 6 1 H19"/><circle cx="6" cy="6" r="1.3" fill="${color}" stroke="none"/></g>`;
}

export function buildMoonPosterSvg(opts: MoonSvgOptions): string {
  const { data: p, facts, labels: l, fonts, watermark } = opts;
  const id = opts.idPrefix ?? 'moon';
  const href = opts.imageHref ?? MOON_IMAGE_URL;
  const t = POSTER_THEMES[p.style];
  const pal = MOON_PALETTES[p.style];
  const W = MOON_POSTER_WIDTH;
  const H = MOON_POSTER_HEIGHT;
  const cx = W / 2;
  const R = MOON_RADIUS;

  const text = (content: string, y: number, size: number, fill: string, weight: 400 | 700 = 400) =>
    `<text x="${cx}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle" direction="rtl">${esc(content)}</text>`;

  const parts: string[] = [];
  const maxW = W - 2 * 81;
  const meta = [
    p.showCity ? p.city : null,
    p.showDate ? p.dateLabel : null,
    p.showDate && p.timeLabel ? `${l.timeAt} ${p.timeLabel}` : null,
  ].filter(Boolean);

  // background stars, kept clear of the Moon and of the frame
  if (p.showStars) {
    const rand = mulberry32(2024);
    const dots: string[] = [];
    while (dots.length < 110) {
      const x = 70 + rand() * (W - 140);
      const y = 70 + rand() * (H - 140);
      if (Math.hypot(x - MOON_X, y - MOON_Y) < R * 1.28) continue;
      const size = 0.7 + rand() ** 3 * 2.2;
      dots.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(size)}" opacity="${n(0.25 + rand() * 0.55)}"/>`);
    }
    parts.push(`<g fill="${t.dark ? t.ink : t.frame}" opacity="${t.dark ? 1 : 0.5}">${dots.join('')}</g>`);
  }

  parts.push(text(l.headerLine, 94, 27, t.accent));

  // the Moon
  const rot = moonRotation(facts.latitude);
  if (pal.halo) {
    parts.push(
      `<circle cx="${MOON_X}" cy="${MOON_Y}" r="${R * 1.55}" fill="url(#${id}-halo)" opacity="${n(0.25 + 0.75 * facts.illumination)}"/>`,
    );
  }
  parts.push(
    `<g transform="translate(${MOON_X} ${MOON_Y})">` +
      `<circle r="${R + 26}" fill="none" stroke="${pal.ring}" stroke-opacity="0.55" stroke-width="1.4"/>` +
      `<circle r="${R + 38}" fill="none" stroke="${pal.ring}" stroke-opacity="0.25" stroke-width="1"/>` +
      `<g clip-path="url(#${id}-disc)"><g transform="rotate(${rot})">` +
      `<circle r="${R}" fill="#9a9a9a"/><image href="${esc(href)}" x="${-R}" y="${-R}" width="${R * 2}" height="${R * 2}" preserveAspectRatio="xMidYMid slice"/>` +
      `</g>` +
      // the unlit side: the shadow is drawn upright, the surface above is what turns
      `<g filter="url(#${id}-edge)" transform="rotate(${rot})"><path d="${shadowDisc(R * 1.06)}${litPath(R, facts.illumination, facts.waxing)}" fill="${pal.shadow}" fill-opacity="${pal.shadowOpacity}" fill-rule="evenodd"/></g>` +
      `</g>` +
      `<circle r="${R}" fill="none" stroke="${pal.ring}" stroke-opacity="${pal.halo ? 0.35 : 0.8}" stroke-width="${pal.halo ? 1 : 1.6}"/>` +
      `</g>`,
  );

  if (p.showDetails) parts.push(text(facts.phaseLine, MOON_Y + R + 78, 28, t.accent));

  const divider = (dy: number) =>
    `<rect x="${cx - 190}" y="${dy - 0.6}" width="154" height="1.2" fill="url(#${id}-divL)"/>` +
    `<rect x="${cx + 36}" y="${dy - 0.6}" width="154" height="1.2" fill="url(#${id}-divR)"/>` +
    `<path transform="translate(${cx} ${dy}) scale(2.6)" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="${t.frame}"/>`;

  // text anchored to the bottom, growing upwards so long lines never run off the page
  const titleLines = wrapText(p.title, 60, maxW, 0.56).slice(0, 2);
  const quoteLines = p.quote ? wrapText(p.quote, 30, maxW * 0.88).slice(0, 3) : [];
  const hasHead = titleLines.length > 0 || Boolean(p.names);

  if (watermark) parts.push(text(l.watermark, 1274, 20, t.muted));
  if (meta.length) parts.push(text(meta.join('   •   '), 1225, 28, t.ink));
  const bottom = meta.length ? 1225 : watermark ? 1274 : 1290;

  let y = bottom - 64;
  if (quoteLines.length) {
    const first = y - 56 * (quoteLines.length - 1);
    quoteLines.forEach((line, i) => parts.push(text(line, first + 56 * i, 30, t.muted)));
    y = first;
    if (hasHead) {
      y -= 62;
      parts.push(divider(y));
    }
  }
  if (hasHead) {
    if (p.names) {
      y -= quoteLines.length ? 42 : 0;
      parts.push(text(p.names, y, 38, t.accent));
      y -= 84;
    } else if (quoteLines.length) {
      y -= 48;
    }
    titleLines
      .slice()
      .reverse()
      .forEach((line, i) => parts.push(text(line, y - 80 * i, 60, t.ink, 700)));
  }

  const fontCss = fonts
    ? `@font-face{font-family:'Vazirmatn';font-weight:400;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2')}` +
      `@font-face{font-family:'Vazirmatn';font-weight:700;src:url(data:font/woff2;base64,${fonts.bold}) format('woff2')}`
    : '';

  const stops = t.paperStops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  const paper = t.linear
    ? `<linearGradient id="${id}-paper" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>`
    : `<radialGradient id="${id}-paper" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${H * 0.38}" r="${H * 0.78}" gradientTransform="translate(${cx} ${H * 0.38}) scale(1.2 0.7) translate(${-cx} ${-H * 0.38})">${stops}</radialGradient>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(l.mapAlt)}">` +
    `<defs><style>${fontCss}text{font-family:'Vazirmatn',Tahoma,sans-serif}</style>` +
    paper +
    `<clipPath id="${id}-disc"><circle r="${R}"/></clipPath>` +
    (pal.halo
      ? `<radialGradient id="${id}-halo"><stop offset="0.35" stop-color="${pal.halo}" stop-opacity="0.32"/><stop offset="1" stop-color="${pal.halo}" stop-opacity="0"/></radialGradient>`
      : '') +
    `<filter id="${id}-edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${n(R * 0.014)}"/></filter>` +
    `<linearGradient id="${id}-divL" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}" stop-opacity="0"/><stop offset="1" stop-color="${t.frame}"/></linearGradient>` +
    `<linearGradient id="${id}-divR" x1="0" x2="1"><stop offset="0" stop-color="${t.frame}"/><stop offset="1" stop-color="${t.frame}" stop-opacity="0"/></linearGradient>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#${id}-paper)"/>` +
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
