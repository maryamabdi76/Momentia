import { isPosterTemplate } from './templates.ts';
import { isPosterStyle } from './themes.ts';
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

/** Checks untrusted data (storage, a shared link) and returns it as a draft, or null. */
export function parseDraft(parsed: unknown): PosterDraft | null {
  if (!isRecord(parsed) || !isRecord(parsed.moment) || !isRecord(parsed.personal)) {
    return null;
  }
  const { moment: m, personal: p } = parsed;
  const strings = [m.city, m.timezone, m.day, m.month, m.year, m.time, p.title, p.names, p.quote];
  if (strings.some((v) => typeof v !== 'string')) return null;
  if (!isPosterStyle(p.style)) return null;
  // drafts saved before templates existed have none; the stepper fills in the default
  if (p.template !== undefined && !isPosterTemplate(p.template)) return null;
  return parsed as unknown as PosterDraft;
}

export function loadDraft(): PosterDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return parseDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}
