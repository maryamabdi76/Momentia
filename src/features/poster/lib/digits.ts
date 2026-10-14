const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** "30 آذر 1405 · 21:00" → "۳۰ آذر ۱۴۰۵ · ۲۱:۰۰" */
export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

/** 49000 → "۴۹٬۰۰۰" (Persian digits, Arabic thousands separator). */
export function formatToman(value: number): string {
  return toPersianDigits(
    String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'),
  );
}
