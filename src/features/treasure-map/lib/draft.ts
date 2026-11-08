import { treasureMapSchema, type TreasureMapValues } from './schemas';

/** The map being edited, kept in this browser only so it survives the payment trip. */
const KEY = 'momentia.map.draft.v1';

export function saveMapDraft(draft: TreasureMapValues) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export function loadMapDraft(): TreasureMapValues | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    // drafts saved before maps had a scope or theme get the defaults
    const withDefaults =
      typeof stored === 'object' && stored !== null
        ? { scope: 'city', area: 'تهران', theme: 'paper', shape: 'circle', ...stored }
        : stored;
    const parsed = treasureMapSchema.safeParse(withDefaults);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
