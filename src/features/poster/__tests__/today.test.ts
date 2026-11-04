import test from 'node:test';
import assert from 'node:assert/strict';
import { gregorianToJalali, jalaliToGregorian, jalaliMonthLength } from '../lib/jalali.ts';
import { todayJalali } from '../lib/today.ts';
import { JALALI_YEARS } from '../lib/calendar.ts';

test('known dates convert to Jalali', () => {
  assert.deepEqual(gregorianToJalali(2021, 3, 21), { year: 1400, month: 1, day: 1 });
  assert.deepEqual(gregorianToJalali(2026, 3, 21), { year: 1405, month: 1, day: 1 });
  assert.deepEqual(gregorianToJalali(2026, 11, 4), { year: 1405, month: 8, day: 13 });
  assert.deepEqual(gregorianToJalali(2025, 12, 21), { year: 1404, month: 9, day: 30 }); // Yalda 1404
  assert.deepEqual(gregorianToJalali(2024, 3, 19), { year: 1402, month: 12, day: 29 }); // last day of 1402
  assert.deepEqual(gregorianToJalali(2024, 3, 20), { year: 1403, month: 1, day: 1 });
});

test('Gregorian → Jalali undoes Jalali → Gregorian over every selectable year', () => {
  for (const y of [1300, 1337, 1399, 1403, 1405, 1409]) {
    for (let m = 1; m <= 12; m++) {
      for (const d of [1, 15, jalaliMonthLength(y, m)]) {
        const g = jalaliToGregorian(y, m, d)!;
        assert.deepEqual(gregorianToJalali(g.year, g.month, g.day), { year: y, month: m, day: d });
      }
    }
  }
});

test("today's fields are what the date pickers can hold", () => {
  for (const now of [new Date(2026, 10, 4), new Date(2026, 2, 20), new Date(2026, 2, 21), new Date(2027, 0, 1)]) {
    const t = todayJalali(now);
    assert.match(t.day, /^\d{1,2}$/);
    assert.ok(Number(t.day) >= 1 && Number(t.day) <= 31);
    assert.ok(JALALI_YEARS.includes(t.year), t.year);
  }
  assert.deepEqual(todayJalali(new Date(2026, 10, 4)), { day: '13', month: 'آبان', year: '1405' });
  assert.deepEqual(todayJalali(new Date(2026, 2, 20, 23, 59)), { day: '29', month: 'اسفند', year: '1404' });
});
