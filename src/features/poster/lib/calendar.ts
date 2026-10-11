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
export const JALALI_DAYS: string[] = Array.from({ length: 31 }, (_, i) => String(i + 1));

/** Years 1390–1409, descending */
export const JALALI_YEARS: string[] = Array.from({ length: 20 }, (_, i) => String(1390 + i)).reverse();

export const DEFAULT_TIME = '21:00';
