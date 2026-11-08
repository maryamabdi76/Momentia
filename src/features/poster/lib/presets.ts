import type { JalaliFields } from './today.ts';

/**
 * The link `/create?moment=yalda` (and `/moon?moment=yalda`) starts on Yalda night, the
 * last night of Azar: 30 Azar 1405 is 21 December 2026. The date pickers hold Latin digits.
 */
export const YALDA_FIELDS: JalaliFields = { day: '30', month: 'آذر', year: '1405' };
export const YALDA_TIME = '21:00';

export function isYaldaPreset(value: string | null): boolean {
  return value === 'yalda';
}
