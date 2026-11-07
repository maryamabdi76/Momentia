export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export type JalaliMonth = (typeof JALALI_MONTHS)[number];

/** Days 1–31 */
export const JALALI_DAYS: string[] = Array.from({ length: 31 }, (_, i) =>
  String(i + 1),
);

/** Years 1390–1409, descending */
export const JALALI_YEARS: string[] = Array.from({ length: 110 }, (_, i) =>
  String(1300 + i),
).reverse();

export const DEFAULT_TIME = '21:00';

/** A value from `<input type="date">` ("2026-12-21") as the Jalali fields of the form, or null if it has none. */
export function jalaliFieldsFromIso(
  iso: string,
  toJalali: (y: number, m: number, d: number) => { year: number; month: number; day: number },
): { day: string; month: (typeof JALALI_MONTHS)[number]; year: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const j = toJalali(Number(m[1]), Number(m[2]), Number(m[3]));
  const month = JALALI_MONTHS[j.month - 1];
  const year = String(j.year);
  if (!month || !JALALI_YEARS.includes(year)) return null;
  return { day: String(j.day), month, year };
}
