import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeSky, sunAltitude } from '../lib/compute.ts';
import { precessFromJ2000, centuriesTT } from '../lib/astro.ts';
import type { SkyCatalog } from '../lib/types.ts';

const read = (name: string) =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const catalog: SkyCatalog = {
  stars: read('stars.json').stars,
  lines: read('constellation-lines.json').lines,
};

const TEHRAN = { latitude: 35.69, longitude: 51.39 };
// Polaris is the only catalog star within a degree of the pole.
const polarisStar = catalog.stars.find(([, dec]) => dec > 89)!;
const polarisOnly: SkyCatalog = { stars: [polarisStar], lines: [] };
const altitudeFromChart = (x: number, y: number) =>
  90 - 2 * Math.atan(Math.hypot(x, y)) * (180 / Math.PI);
const close = (actual: number, expected: number, tol: number, label: string) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: got ${actual}, expected ${expected} ± ${tol}`);

test('catalog is the size we expect', () => {
  assert.equal(catalog.stars.length, 2851);
  assert.equal(catalog.lines.length, 89);
  assert.ok(catalog.stars.every(([ra, dec]) => ra >= 0 && ra < 360 && dec >= -90 && dec <= 90));
});

test('precession moves Polaris toward the pole (declination ≈ 89.37° in late 2026)', () => {
  const polaris = catalog.stars.find(([, dec, mag]) => dec > 89 && mag < 2.5)!;
  const { dec } = precessFromJ2000(polaris[0], polaris[1], centuriesTT(new Date('2026-10-13T00:00:00Z')));
  close(dec, 89.37, 0.03, 'Polaris declination');
});

test('Polaris stays within a degree of the observer’s latitude, at any hour', () => {
  for (const hour of [0, 5, 11, 17, 22]) {
    const date = new Date(Date.UTC(2023, 11, 21, hour));
    const [polaris] = computeSky({ ...TEHRAN, date, catalog: polarisOnly }).stars;
    assert.ok(polaris, `Polaris is always above the horizon in Tehran (${hour}:00 UTC)`);
    close(altitudeFromChart(polaris.x, polaris.y), TEHRAN.latitude, 1, `Polaris altitude at ${hour}:00 UTC`);
  }
});

test('Sirius culminates at 90° − latitude + declination', () => {
  // Sirius: dec −16.72°  →  upper culmination altitude 90 − 35.69 − 16.72 = 37.59°
  const sirius = catalog.stars[0]!;
  let best = -90;
  for (let m = 0; m < 24 * 60; m += 2) {
    const date = new Date(Date.UTC(2024, 0, 15, 0, m));
    const sky = computeSky({ ...TEHRAN, date, catalog: { stars: [sirius], lines: [] } });
    if (sky.stars[0]) {
      best = Math.max(best, altitudeFromChart(sky.stars[0].x, sky.stars[0].y));
    }
  }
  close(best, 37.59, 0.15, 'Sirius culmination');
});

test('Sun reaches 90° − latitude at solar noon on the March equinox', () => {
  let best = -90;
  for (let m = 0; m < 24 * 60; m += 5) {
    best = Math.max(best, sunAltitude(new Date(Date.UTC(2026, 2, 20, 0, m)), TEHRAN.latitude, TEHRAN.longitude));
  }
  close(best, 90 - TEHRAN.latitude, 0.3, 'noon altitude');
});

test('Tehran sunrise on Yalda 1402 (21 Dec 2023) is about 07:12 local', () => {
  // Sun crosses −0.833° (upper limb on the horizon) between 03:00 and 05:00 UTC.
  let crossing = 0;
  for (let m = 3 * 60; m < 5 * 60; m++) {
    const t = Date.UTC(2023, 11, 21, 0, m);
    if (sunAltitude(new Date(t), TEHRAN.latitude, TEHRAN.longitude) >= -0.833) {
      crossing = m;
      break;
    }
  }
  const localMinutes = crossing + 3.5 * 60; // UTC+3:30
  close(localMinutes, 7 * 60 + 12, 5, 'sunrise (minutes after midnight)');
});

test('chart orientation: north up, east left, zenith in the middle', () => {
  const date = new Date('2023-12-21T17:30:00Z');
  const sky = computeSky({ ...TEHRAN, date, catalog });
  const stars = sky.stars.filter((s) => s.mag < 3);
  assert.ok(stars.length > 20);
  assert.ok(stars.every((s) => Math.hypot(s.x, s.y) <= 1.0001), 'everything inside the horizon circle');
  // Polaris (due north) must sit in the upper half, close to the vertical axis.
  const [polaris] = computeSky({ ...TEHRAN, date, catalog: polarisOnly }).stars;
  assert.ok(polaris!.y < -0.4 && Math.abs(polaris!.x) < 0.1, `Polaris at (${polaris!.x}, ${polaris!.y})`);
  // Sirius rises in the south-east of the evening sky in December → lower-left of the chart.
  const sirius = computeSky({ ...TEHRAN, date: new Date('2023-12-21T17:30:00Z'), catalog: { stars: [catalog.stars[0]!], lines: [] } }).stars[0]!;
  assert.ok(sirius.x < 0 && sirius.y > 0, `Sirius at (${sirius.x}, ${sirius.y})`);
});

test('Yalda 1402, 21:00 Tehran: waxing gibbous Moon, about 70% lit, above the horizon', () => {
  const sky = computeSky({ ...TEHRAN, date: new Date('2023-12-21T17:30:00Z'), catalog });
  assert.ok(sky.sunAltitude < -12, 'properly dark');
  assert.equal(sky.moon.waxing, true);
  close(sky.moon.illumination, 0.7, 0.06, 'illumination');
  assert.equal(sky.moon.visible, true);
});

test('stars below the horizon are dropped and lines are clipped to the circle', () => {
  const sky = computeSky({ ...TEHRAN, date: new Date('2023-12-21T17:30:00Z'), catalog });
  assert.ok(sky.stars.length > 500 && sky.stars.length < 2000, `visible stars: ${sky.stars.length}`);
  assert.ok(sky.lines.length > 30);
  for (const piece of sky.lines) {
    for (const [x, y] of piece) assert.ok(Math.hypot(x, y) <= 1.0001, 'line vertex inside circle');
  }
});

test('stars are returned faint-first so bright ones paint on top', () => {
  const sky = computeSky({ ...TEHRAN, date: new Date('2023-12-21T17:30:00Z'), catalog });
  for (let i = 1; i < sky.stars.length; i++) assert.ok(sky.stars[i - 1]!.mag >= sky.stars[i]!.mag);
});

test('computing a full sky is fast enough to run on every keystroke', () => {
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) computeSky({ ...TEHRAN, date: new Date(1.7e12 + i * 6e5), catalog });
  const perCall = (performance.now() - t0) / 20;
  assert.ok(perCall < 25, `computeSky took ${perCall.toFixed(1)} ms`);
});

test('equator and ecliptic guides: above the horizon, and the ecliptic tilts ~23.4° from the equator', () => {
  const sky = computeSky({ ...TEHRAN, date: new Date('2023-12-21T17:30:00Z'), catalog: { stars: [], lines: [] } });
  for (const pieces of [sky.guides.equator, sky.guides.ecliptic]) {
    assert.ok(pieces.length >= 1);
    for (const piece of pieces) {
      for (const [x, y] of piece) assert.ok(Math.hypot(x, y) <= 1.0001, 'inside the horizon circle');
    }
  }
  // The equator crosses the meridian at altitude 90° − latitude (≈ 54.3° in Tehran).
  const alts = sky.guides.equator.flat().map(([x, y]) => altitudeFromChart(x, y));
  close(Math.max(...alts), 90 - TEHRAN.latitude, 0.6, 'equator culmination');
});

test('extendBelowHorizon adds the sky under the horizon, beyond the unit circle; off by default', () => {
  const date = new Date('2023-12-21T17:30:00Z');
  const plain = computeSky({ ...TEHRAN, date, catalog });
  assert.equal(plain.below, undefined);

  const wide = computeSky({ ...TEHRAN, date, catalog, extendBelowHorizon: 50 });
  assert.ok(wide.below && wide.below.stars.length > 200 && wide.below.lines.length > 20);
  // the part above the horizon is untouched by asking for more
  assert.equal(wide.stars.length, plain.stars.length);
  assert.equal(wide.lines.length, plain.lines.length);

  for (const s of wide.below!.stars) {
    const r = Math.hypot(s.x, s.y);
    assert.ok(r > 1 - 1e-9, 'below the horizon means outside the unit circle');
    const alt = altitudeFromChart(s.x, s.y);
    assert.ok(alt <= 1e-6 && alt >= -50 - 1e-6, `altitude ${alt}`);
  }
  for (const piece of wide.below!.lines) {
    for (const [x, y] of piece) {
      const alt = altitudeFromChart(x, y);
      assert.ok(alt <= 1e-6 && alt >= -50 - 1e-6, `line altitude ${alt}`);
    }
  }
});
