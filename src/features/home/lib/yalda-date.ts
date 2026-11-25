/** 30 Azar 1405, 21:00 in Tehran (UTC+3:30, no daylight saving) = 17:30 UTC on 21 Dec 2026. */
export const YALDA_AT = Date.UTC(2026, 11, 21, 17, 30);

const DAY = 24 * 60 * 60 * 1000;

/** The Yalda links stay up for a day after the night, so a late gift is still possible. */
export const YALDA_LINKS_UNTIL = YALDA_AT + DAY;

/** Whether the Yalda campaign (home banner, menu and footer links) should still be shown. */
export function isYaldaCampaign(now: number): boolean {
  return now < YALDA_LINKS_UNTIL;
}
