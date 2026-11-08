/** Searching places by name, with OpenStreetMap's Nominatim. */

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
