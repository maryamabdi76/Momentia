import test from 'node:test';
import assert from 'node:assert/strict';
import { jalaliToGregorian, isJalaliLeapYear } from '../lib/jalali.ts';
import { zonedTimeToUtc } from '../lib/zoned-time.ts';
import { parseClockTime, resolveMoment, type MomentInput } from '../lib/moment.ts';
import { sunAltitude } from '../../sky/lib/compute.ts';

const g = (y: number, m: number, d: number) => jalaliToGregorian(y, m, d);

test('Jalali → Gregorian on well-known dates', () => {
  assert.deepEqual(g(1390, 1, 1), { year: 2011, month: 3, day: 21 });
  assert.deepEqual(g(1395, 1, 1), { year: 2016, month: 3, day: 20 });
  assert.deepEqual(g(1399, 1, 1), { year: 2020, month: 3, day: 20 });
  assert.deepEqual(g(1400, 1, 1), { year: 2021, month: 3, day: 21 });
  assert.deepEqual(g(1402, 1, 1), { year: 2023, month: 3, day: 21 });
  assert.deepEqual(g(1403, 1, 1), { year: 2024, month: 3, day: 20 });
  assert.deepEqual(g(1404, 1, 1), { year: 2025, month: 3, day: 21 });
  assert.deepEqual(g(1402, 7, 1), { year: 2023, month: 9, day: 23 });
  assert.deepEqual(g(1402, 9, 30), { year: 2023, month: 12, day: 21 }); // Yalda
});

test('leap years and impossible dates', () => {
  assert.deepEqual([1399, 1403, 1408, 1412].map(isJalaliLeapYear), [true, true, true, true]);
  assert.deepEqual([1400, 1401, 1402, 1404].map(isJalaliLeapYear), [false, false, false, false]);
  assert.deepEqual(g(1403, 12, 30), { year: 2025, month: 3, day: 20 });
  assert.equal(g(1402, 12, 30), null);
  assert.equal(g(1402, 7, 31), null);
  assert.equal(g(1402, 13, 1), null);
});

test('consecutive Jalali days map to consecutive Gregorian days across 20 years', () => {
  let prev = Date.UTC(2011, 2, 21) - 86_400_000;
  for (let y = 1390; y <= 1409; y++) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const r = g(y, m, d);
        if (!r) continue;
        const t = Date.UTC(r.year, r.month - 1, r.day);
        assert.equal(t - prev, 86_400_000, `${y}/${m}/${d}`);
        prev = t;
      }
    }
  }
});

test('Tehran local time → UTC, including the pre-2022 daylight-saving period', () => {
  assert.equal(zonedTimeToUtc(2023, 12, 21, 21, 0, 'Asia/Tehran').toISOString(), '2023-12-21T17:30:00.000Z');
  assert.equal(zonedTimeToUtc(2023, 7, 1, 12, 0, 'Asia/Tehran').toISOString(), '2023-07-01T08:30:00.000Z'); // +3:30
  assert.equal(zonedTimeToUtc(2019, 7, 1, 12, 0, 'Asia/Tehran').toISOString(), '2019-07-01T07:30:00.000Z'); // +4:30 DST
});

test('clock times accept Persian digits and reject nonsense', () => {
  assert.deepEqual(parseClockTime('21:00'), [21, 0]);
  assert.deepEqual(parseClockTime('۲۱:۳۰'), [21, 30]);
  assert.deepEqual(parseClockTime('9:05'), [9, 5]);
  assert.equal(parseClockTime('25:00'), null);
  assert.equal(parseClockTime('2'), null);
  assert.equal(parseClockTime(''), null);
});

const yalda: MomentInput = { city: 'تهران', day: '30', month: 'آذر', year: '1402', time: '21:00', noExactTime: false };

test('resolveMoment: Yalda 1402 at 21:00 in Tehran', () => {
  const r = resolveMoment(yalda)!;
  assert.equal(r.instant.toISOString(), '2023-12-21T17:30:00.000Z');
  assert.equal(r.latitude, 35.69);
  assert.equal(r.adjustedToNight, false);
  assert.equal(r.dayClamped, false);
});

test('resolveMoment: "no exact time" uses 21:00, and a half-typed time does too', () => {
  const a = resolveMoment({ ...yalda, time: '03:00', noExactTime: true })!;
  const b = resolveMoment({ ...yalda, time: '2' })!;
  assert.equal(a.instant.toISOString(), '2023-12-21T17:30:00.000Z');
  assert.equal(b.instant.toISOString(), '2023-12-21T17:30:00.000Z');
});

test('resolveMoment: a daytime memory moves to that evening, but dusk stays as typed', () => {
  const noon = resolveMoment({ ...yalda, time: '12:00' })!;
  assert.equal(noon.adjustedToNight, true);
  assert.ok(noon.instant.getTime() > Date.parse('2023-12-21T08:30:00Z'));
  assert.ok(sunAltitude(noon.instant, noon.latitude, noon.longitude) <= -12);

  const dusk = resolveMoment({ ...yalda, time: '17:30' })!; // sun ≈ −5°
  assert.equal(dusk.adjustedToNight, false);
  assert.equal(dusk.instant.toISOString(), '2023-12-21T14:00:00.000Z');
});

test('resolveMoment: 31 Mehr is clamped; unknown city or month gives null', () => {
  const r = resolveMoment({ ...yalda, day: '31', month: 'مهر' })!;
  assert.equal(r.dayClamped, true);
  assert.equal(resolveMoment({ ...yalda, city: 'ناکجاآباد' }), null);
  assert.equal(resolveMoment({ ...yalda, month: 'x' }), null);
});
