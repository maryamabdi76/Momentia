import type { MomentData, PersonalizeData } from '../components/CreateStepper';

/**
 * The poster being edited, kept in this browser only so it survives the trip to
 * the payment gateway and back.
 */
export type PosterDraft = { moment: MomentData; personal: PersonalizeData };

const KEY = 'momentia.draft.v1';

export function saveDraft(draft: PosterDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

export function loadDraft(): PosterDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.moment) || !isRecord(parsed.personal)) {
      return null;
    }
    const { moment: m, personal: p } = parsed;
    const strings = [m.city, m.timezone, m.day, m.month, m.year, m.time, p.title, p.names, p.quote];
    if (strings.some((v) => typeof v !== 'string')) return null;
    if (p.style !== 'gold' && p.style !== 'mono') return null;
    return parsed as unknown as PosterDraft;
  } catch {
    return null;
  }
}
