import { sunAltitude } from '../../sky/lib/compute.ts';
import { DEFAULT_TIME, JALALI_MONTHS } from './calendar.ts';
import { findCity } from './cities.ts';
import { jalaliMonthLength, jalaliToGregorian } from './jalali.ts';
import { zonedTimeToUtc } from './zoned-time.ts';

/** The subset of the step-1 form state needed to know *when* and *where*. */
export type MomentInput = {
  city: string;
  day: string;
  month: string;
  year: string;
  time: string;
  noExactTime: boolean;
};

export type ResolvedMoment = {
  /** The real instant that the sky is computed for. */
  instant: Date;
  latitude: number;
  longitude: number;
  timeZone: string;
  /** The chosen time was in daylight, so the evening of that date is used instead. */
  adjustedToNight: boolean;
  /** The chosen day does not exist in that month (e.g. 31 Mehr) and was pulled back to the last day. */
  dayClamped: boolean;
};

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (c) => {
    const i = PERSIAN_DIGITS.indexOf(c);
    return String(i >= 0 ? i : ARABIC_DIGITS.indexOf(c));
  });
}

/** "21:00", "۲۱:۰۰", "9:5" → [hour, minute]; anything else → null. */
export function parseClockTime(value: string): [number, number] | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(toLatinDigits(value.trim()));
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour <= 23 && minute <= 59 ? [hour, minute] : null;
}

const STEP_MS = 10 * 60_000;
const SUNRISE_SUNSET_ALTITUDE = -0.833;
const DARK_ALTITUDE = -12; // end of nautical twilight

/**
 * Turns the form's Jalali date, city and local time into one real instant plus
 * coordinates, or null while the form holds something unusable (a half-typed
 * time is tolerated and falls back to 21:00).
 *
 * If the chosen time is in daylight the sky would be empty, so — as the page
 * promises — the night of that date is used: the first moment, within the
 * following 24 hours, when the Sun is 12° below the horizon.
 */
export function resolveMoment(input: MomentInput): ResolvedMoment | null {
  const city = findCity(input.city);
  if (!city) return null;

  const monthIndex = (JALALI_MONTHS as readonly string[]).indexOf(input.month);
  const jy = Number(toLatinDigits(input.year));
  const jd = Number(toLatinDigits(input.day));
  if (monthIndex < 0 || !Number.isInteger(jy) || !Number.isInteger(jd) || jd < 1) return null;

  const month = monthIndex + 1;
  const day = Math.min(jd, jalaliMonthLength(jy, month));
  const greg = jalaliToGregorian(jy, month, day);
  if (!greg) return null;

  const [hour, minute] =
    (input.noExactTime ? null : parseClockTime(input.time)) ??
    (parseClockTime(DEFAULT_TIME) as [number, number]);

  let instant = zonedTimeToUtc(greg.year, greg.month, greg.day, hour, minute, city.tz);
  let adjustedToNight = false;

  if (sunAltitude(instant, city.lat, city.lon) > SUNRISE_SUNSET_ALTITUDE) {
    for (let t = instant.getTime() + STEP_MS; t <= instant.getTime() + 24 * 3_600_000; t += STEP_MS) {
      if (sunAltitude(new Date(t), city.lat, city.lon) <= DARK_ALTITUDE) {
        instant = new Date(t);
        adjustedToNight = true;
        break;
      }
    }
  }

  return {
    instant,
    latitude: city.lat,
    longitude: city.lon,
    timeZone: city.tz,
    adjustedToNight,
    dayClamped: day !== jd,
  };
}
