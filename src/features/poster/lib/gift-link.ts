import { parseDraft, type PosterDraft } from './draft.ts';

/**
 * A poster as a link: the whole draft is packed into the URL *fragment*
 * (`/gift#g=…`), which browsers never send to a server, so sharing a poster
 * keeps "nothing is stored on our side" true.
 */
const PARAM = 'g';

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// ---- the compact format -------------------------------------------------------------
// A link used to carry the whole draft as JSON with long key names, which made it very
// long to paste. Version 2 is a positional array with the choices as small numbers.
//
// These lists are part of the link format: a link shared today must open next year, so
// they are frozen copies (never reorder or remove; a choice added later is written by
// name until it is appended here).
const STYLES = ['mono', 'gold', 'black', 'parchment', 'violet'];
const FRAMES = ['classic', 'minimal', 'double', 'stars', 'rounded', 'deco', 'none'];
const TEMPLATES = ['circle', 'full'];
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const DEFAULT_TZ = 'Asia/Tehran';
const V2 = '2.';

type Json = string | number | null;
const toCode = (list: string[], v: unknown): Json => {
  if (typeof v !== 'string') return null;
  const i = list.indexOf(v);
  return i >= 0 ? i : v;
};
const fromCode = (list: string[], v: unknown): string | undefined =>
  typeof v === 'number' ? list[v] : typeof v === 'string' ? v : undefined;

// bit order of the layer switches; also frozen
const LAYER_KEYS = [
  'constellationLines',
  'constellationArt',
  'moonAndPlanets',
  'planetNames',
  'ecliptic',
  'equator',
] as const;

function compact(draft: PosterDraft): unknown[] {
  const m = (draft.moment ?? {}) as Partial<PosterDraft['moment']>;
  const p = (draft.personal ?? {}) as Partial<PosterDraft['personal']>;
  const l = (p.layers ?? {}) as Record<string, unknown>;
  return [
    m.city ?? '',
    m.timezone === DEFAULT_TZ ? 0 : (m.timezone ?? ''),
    m.day ?? '',
    toCode(MONTHS, m.month),
    m.year ?? '',
    m.time ?? '',
    (m.noExactTime ? 1 : 0) | (p.showDate ? 2 : 0) | (p.showCity ? 4 : 0),
    p.title ?? '',
    p.names ?? '',
    p.quote ?? '',
    toCode(STYLES, p.style),
    toCode(TEMPLATES, p.template),
    toCode(FRAMES, p.frame),
    p.layers ? LAYER_KEYS.reduce((bits, key, i) => bits | (l[key] ? 1 << i : 0), 0) : null,
    typeof l.maxMagnitude === 'number' ? l.maxMagnitude : null,
  ];
}

function expand(a: unknown): unknown {
  if (!Array.isArray(a) || a.length < 15) return null;
  const [city, tz, day, month, year, time, bits, title, names, quote, style, template, frame, layerBits, mag] = a;
  const flags = typeof bits === 'number' ? bits : 0;
  const layers =
    typeof layerBits === 'number'
      ? {
          ...Object.fromEntries(LAYER_KEYS.map((key, i) => [key, (layerBits & (1 << i)) !== 0])),
          maxMagnitude: typeof mag === 'number' ? mag : undefined,
        }
      : undefined;
  const frameName = fromCode(FRAMES, frame);
  const templateName = fromCode(TEMPLATES, template);
  return {
    moment: {
      city,
      timezone: tz === 0 ? DEFAULT_TZ : tz,
      day,
      month: fromCode(MONTHS, month),
      year,
      time,
      noExactTime: (flags & 1) !== 0,
    },
    personal: {
      title,
      names,
      quote,
      style: fromCode(STYLES, style),
      ...(templateName ? { template: templateName } : {}),
      ...(frameName ? { frame: frameName } : {}),
      showDate: (flags & 2) !== 0,
      showCity: (flags & 4) !== 0,
      ...(layers ? { layers } : {}),
    },
  };
}

export function encodeGift(draft: PosterDraft): string {
  return V2 + toBase64Url(new TextEncoder().encode(JSON.stringify(compact(draft))));
}

export function decodeGift(token: string): PosterDraft | null {
  try {
    // links made before the compact format are the whole draft as JSON
    const v2 = token.startsWith(V2);
    const json = new TextDecoder().decode(fromBase64Url(v2 ? token.slice(V2.length) : token));
    const parsed: unknown = JSON.parse(json);
    return parseDraft(v2 ? expand(parsed) : parsed);
  } catch {
    return null;
  }
}

/** The old, long format. Kept only so a test can prove that links already shared still open. */
export function encodeGiftLegacy(draft: PosterDraft): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(draft)));
}

export function giftUrl(origin: string, draft: PosterDraft): string {
  return `${origin}/gift#${PARAM}=${encodeGift(draft)}`;
}

/** Reads `location.hash` of the gift page; null when it has no usable poster. */
export function readGiftHash(hash: string): PosterDraft | null {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get(PARAM);
  return token ? decodeGift(token) : null;
}

/** A link back into the editor with this draft loaded, to keep and continue later. Also kept in the fragment. */
export function editUrl(origin: string, draft: PosterDraft): string {
  return `${origin}/create#e=${encodeGift(draft)}`;
}

/** Reads `location.hash` of the editor; null when it carries no usable draft. */
export function readEditHash(hash: string): PosterDraft | null {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('e');
  return token ? decodeGift(token) : null;
}
