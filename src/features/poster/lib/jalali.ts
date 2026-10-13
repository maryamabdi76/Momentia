/**
 * Jalali (Solar Hijri) → Gregorian, for the years the date picker offers.
 *
 * Uses the 33-year arithmetic rule for leap years (years whose position in the
 * cycle is 1, 5, 9, 13, 17, 22, 26 or 30), anchored on a date that is certain:
 * 1 Farvardin 1400 = 21 March 2021. That rule agrees with the official
 * astronomical calendar for 1210–1473, which covers every selectable year.
 */

const LEAP_POSITIONS = new Set([1, 5, 9, 13, 17, 22, 26, 30]);
const ANCHOR_YEAR = 1400;
const ANCHOR_UTC_MS = Date.UTC(2021, 2, 21);
const DAY_MS = 86_400_000;

export function isJalaliLeapYear(year: number): boolean {
  return LEAP_POSITIONS.has(((year % 33) + 33) % 33);
}

/** Months 1–6 have 31 days, 7–11 have 30, and Esfand has 29 (30 in a leap year). */
export function jalaliMonthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

const yearLength = (year: number) => (isJalaliLeapYear(year) ? 366 : 365);

export type GregorianDate = { year: number; month: number; day: number };

/** Returns null for an impossible date (e.g. 31 Mehr or 30 Esfand 1402). */
export function jalaliToGregorian(
  year: number,
  month: number,
  day: number,
): GregorianDate | null {
  if (![year, month, day].every(Number.isInteger)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > jalaliMonthLength(year, month)) return null;

  let days = 0;
  if (year >= ANCHOR_YEAR) {
    for (let y = ANCHOR_YEAR; y < year; y++) days += yearLength(y);
  } else {
    for (let y = year; y < ANCHOR_YEAR; y++) days -= yearLength(y);
  }
  for (let m = 1; m < month; m++) days += jalaliMonthLength(year, m);
  days += day - 1;

  const d = new Date(ANCHOR_UTC_MS + days * DAY_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}
