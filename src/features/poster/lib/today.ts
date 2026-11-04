import { JALALI_MONTHS, type JalaliMonth } from './calendar.ts';
import { gregorianToJalali } from './jalali.ts';

/** A date as the date pickers hold it: Latin digits, the month by name. */
export type JalaliFields = { day: string; month: JalaliMonth; year: string };

/**
 * Today's Jalali date, read from the device's calendar day. This has to run in the
 * browser: on the server (or at build time) it would be the server's day, frozen.
 */
export function todayJalali(now: Date = new Date()): JalaliFields {
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return { day: String(j.day), month: JALALI_MONTHS[j.month - 1]!, year: String(j.year) };
}
