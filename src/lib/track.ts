import { track } from '@vercel/analytics';

type EventData = Record<string, string | number | boolean>;

/** Anonymous funnel events (Vercel Analytics). Never throws; carries no personal text. */
export function trackEvent(name: string, data?: EventData): void {
  try {
    track(name, data);
  } catch {
    // analytics must never break the poster flow
  }
}
