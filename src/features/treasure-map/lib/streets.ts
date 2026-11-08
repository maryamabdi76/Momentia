import type { LonLat } from './mercator.ts';

/** What we draw of a place: its streets, rivers, water and parks, from OpenStreetMap. */
export type StreetData = {
  /** Motorways to secondary roads. */
  major: LonLat[][];
  /** Everything else with a name or a purpose: tertiary, residential, pedestrian. */
  minor: LonLat[][];
  rivers: LonLat[][];
  water: LonLat[][];
  parks: LonLat[][];
};

export type Bounds = { south: number; west: number; north: number; east: number };

const MAJOR = new Set(['motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link']);
const MINOR = new Set(['tertiary', 'tertiary_link', 'residential', 'unclassified', 'living_street', 'pedestrian']);

const MAJOR_ONLY = '^(motorway|trunk|primary|secondary)$';
const ALL_ROADS = '^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian)$';

/**
 * Overpass query for a box. Large areas ask for main roads only, so one request
 * stays small enough to answer in a few seconds.
 */
export function buildQuery(b: Bounds, majorOnly: boolean): string {
  const box = `(${[b.south, b.west, b.north, b.east].map((v) => v.toFixed(5)).join(',')})`;
  return (
    `[out:json][timeout:25];(` +
    `way["highway"~"${majorOnly ? MAJOR_ONLY : ALL_ROADS}"]${box};` +
    `way["waterway"~"^(river|canal)$"]${box};` +
    `way["natural"="water"]${box};` +
    `way["leisure"="park"]${box};` +
    `);out geom qt;`
  );
}

const r5 = (v: number) => Math.round(v * 1e5) / 1e5;

function isLatLon(g: unknown): g is { lat: number; lon: number } {
  return (
    typeof g === 'object' &&
    g !== null &&
    typeof (g as { lat?: unknown }).lat === 'number' &&
    typeof (g as { lon?: unknown }).lon === 'number'
  );
}

/** Reads an Overpass `out geom` answer. Anything unexpected is skipped, never thrown on. */
export function parseOverpass(json: unknown, maxPoints = 60000): StreetData {
  const out: StreetData = { major: [], minor: [], rivers: [], water: [], parks: [] };
  const elements = (json as { elements?: unknown } | null)?.elements;
  if (!Array.isArray(elements)) return out;
  let points = 0;
  for (const el of elements) {
    if (typeof el !== 'object' || el === null) continue;
    const { type, tags, geometry } = el as { type?: unknown; tags?: Record<string, string>; geometry?: unknown };
    if (type !== 'way' || !tags || !Array.isArray(geometry)) continue;
    const line = geometry.filter(isLatLon).map((g) => ({ lon: r5(g.lon), lat: r5(g.lat) }));
    if (line.length < 2) continue;
    if (points + line.length > maxPoints) break;
    points += line.length;
    if (tags.highway && MAJOR.has(tags.highway)) out.major.push(line);
    else if (tags.highway && MINOR.has(tags.highway)) out.minor.push(line);
    else if (tags.waterway) out.rivers.push(line);
    else if (tags.natural === 'water') out.water.push(line);
    else if (tags.leisure === 'park') out.parks.push(line);
  }
  return out;
}

export const hasStreets = (d: StreetData | null | undefined): d is StreetData =>
  !!d && d.major.length + d.minor.length > 0;

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
/** The next server is tried this long after the previous one, if it has not answered yet. */
const STAGGER_MS = 4000;
const REQUEST_TIMEOUT_MS = 20000;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const done = () => {
      clearTimeout(t);
      reject(new DOMException('aborted', 'AbortError'));
    };
    const t = setTimeout(() => {
      signal.removeEventListener('abort', done);
      resolve();
    }, ms);
    signal.addEventListener('abort', done, { once: true });
  });

/**
 * Asks OpenStreetMap's Overpass servers for the streets in a box. The first server is asked
 * at once; if it has not answered after a few seconds the next is asked too, and the first
 * good answer wins. A server that does not answer in 20 s is given up on.
 */
export async function fetchStreets(b: Bounds, majorOnly: boolean, signal?: AbortSignal): Promise<StreetData> {
  const body = `data=${encodeURIComponent(buildQuery(b, majorOnly))}`;
  const all = new AbortController();
  const onOuterAbort = () => all.abort();
  signal?.addEventListener('abort', onOuterAbort, { once: true });

  const request = async (url: string, delay: number): Promise<StreetData> => {
    if (delay > 0) await sleep(delay, all.signal);
    const own = new AbortController();
    const timer = setTimeout(() => own.abort(), REQUEST_TIMEOUT_MS);
    const cancel = () => own.abort();
    all.signal.addEventListener('abort', cancel, { once: true });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: own.signal,
      });
      if (!res.ok) throw new Error(`overpass ${res.status}`);
      return parseOverpass(await res.json());
    } finally {
      clearTimeout(timer);
      all.signal.removeEventListener('abort', cancel);
    }
  };

  try {
    return await Promise.any(ENDPOINTS.map((url, i) => request(url, i * STAGGER_MS)));
  } finally {
    all.abort(); // stop the slower requests once one has answered
    signal?.removeEventListener('abort', onOuterAbort);
  }
}

export type PlaceHit = { name: string; detail: string; lat: number; lon: number };

/** Reads a Nominatim search answer into short, displayable hits. */
export function parseNominatim(json: unknown): PlaceHit[] {
  if (!Array.isArray(json)) return [];
  const hits: PlaceHit[] = [];
  for (const it of json) {
    if (typeof it !== 'object' || it === null) continue;
    const o = it as Record<string, unknown>;
    const lat = Number(o.lat);
    const lon = Number(o.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const full = typeof o.display_name === 'string' ? o.display_name : '';
    const name = (typeof o.name === 'string' && o.name) || full.split('،')[0]?.split(',')[0]?.trim() || '';
    if (!name) continue;
    hits.push({ name, detail: full, lat, lon });
  }
  return hits;
}

/** Searches places in Iran by name. Called only when the user asks, never while typing. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=ir&accept-language=fa&q=' +
    encodeURIComponent(query);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`nominatim ${res.status}`);
  return parseNominatim(await res.json());
}
