import { isPosterStyle } from '@/features/poster/lib/themes';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import type { MoonPersonalizeValues } from './schemas';

/** The Moon poster being edited, kept in this browser only so it survives the payment trip. */
export type MoonDraft = { moment: MomentData; personal: MoonPersonalizeValues };

const KEY = 'momentia.moon.draft.v1';

export function saveMoonDraft(draft: MoonDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export function loadMoonDraft(): MoonDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.moment) || !isRecord(parsed.personal)) return null;
    const { moment: m, personal: p } = parsed;
    const strings = [m.city, m.timezone, m.day, m.month, m.year, m.time, p.title, p.names, p.quote];
    if (strings.some((v) => typeof v !== 'string') || !isPosterStyle(p.style)) return null;
    return parsed as unknown as MoonDraft;
  } catch {
    return null;
  }
}
