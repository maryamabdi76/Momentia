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
    const parsed = treasureMapSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
