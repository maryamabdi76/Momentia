/**
 * Wall-clock time in an IANA time zone → the real instant (UTC), using the
 * browser's own tz database. That matters here: Iran observed daylight saving
 * time until 2022, so "21:00 in Tehran" in July 2019 is not the same offset as
 * in July 2023.
 */

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Offset of `timeZone` from UTC, in milliseconds, at the given instant. */
export function timeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = formatterFor(timeZone).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const hour = get('hour') === 24 ? 0 : get('hour');
  const wallAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
  return wallAsUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * @param month 1–12
 * Handles zone changes by re-checking the offset at the first answer; times
 * that fall in a skipped hour resolve to just after the jump.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = timeZoneOffsetMs(guess, timeZone);
  let instant = guess - first;
  const second = timeZoneOffsetMs(instant, timeZone);
  if (second !== first) instant = guess - second;
  return new Date(instant);
}
