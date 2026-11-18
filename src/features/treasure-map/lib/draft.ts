import { sanitizeMap } from './sanitize';
import type { TreasureMapValues } from './schemas';

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
    // an older or damaged save is repaired piece by piece instead of being thrown away
    return sanitizeMap(JSON.parse(raw));
  } catch {
    return null;
  }
}
