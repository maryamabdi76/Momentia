import test from 'node:test';
import assert from 'node:assert/strict';
import {
  angularSeparation,
  centuriesTT,
  equatorialToEcliptic,
  meanObliquityDegrees,
  normalizeDegrees,
  normalizeSignedDegrees,
} from '../lib/astro.ts';
import { moonPosition, planetPositions, sunPosition } from '../lib/ephemeris.ts';

const close = (actual: number, expected: number, tol: number, label: string) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label}: got ${actual}, expected ${expected} ± ${tol}`);

const T_at = (iso: string) => centuriesTT(new Date(iso));
const eclipticLongitude = (p: { ra: number; dec: number }, T: number) =>
  equatorialToEcliptic(p.ra, p.dec, meanObliquityDegrees(T)).lambda;

// Meeus, Astronomical Algorithms, worked examples.
test('Sun matches Meeus example 25.a (1992 Oct 13.0 TD)', () => {
  const T = (2448908.5 - 2451545) / 36525;
  const s = sunPosition(T);
  close(s.lambda, 199.90895, 0.002, 'apparent longitude');
  close(s.distanceAu, 0.99766, 0.0002, 'distance');
  close(s.ra, 198.38083, 0.003, 'right ascension');
  close(s.dec, -7.78507, 0.003, 'declination');
});

test('Moon matches Meeus example 47.a (1992 Apr 12.0 TD)', () => {
  const T = (2448724.5 - 2451545) / 36525;
  const m = moonPosition(T);
  close(m.lambda, 133.162655, 0.005, 'longitude');
  close(m.beta, -3.229126, 0.005, 'latitude');
  close(m.distanceKm, 368409.7, 20, 'distance');
  close(m.ra, 134.68847, 0.01, 'right ascension');
  close(m.dec, 13.768368, 0.01, 'declination');
});

test('Moon phases land on the published quarter times of April 2024', () => {
  const cases: Array<[string, string, number]> = [
    ['new moon', '2024-04-08T18:21:00Z', 0],
    ['first quarter', '2024-04-15T19:13:00Z', 90],
    ['full moon', '2024-04-23T23:49:00Z', 180],
    ['last quarter', '2024-05-01T11:27:00Z', 270],
  ];
  for (const [label, iso, expected] of cases) {
    const T = T_at(iso);
    const elongation = normalizeDegrees(moonPosition(T).lambda - sunPosition(T).lambda);
    close(Math.abs(normalizeSignedDegrees(elongation - expected)), 0, 0.3, label);
  }
});

test('Jupiter and Saturn meet at the great conjunction of 21 Dec 2020', () => {
  const T = T_at('2020-12-21T18:20:00Z');
  const p = planetPositions(T);
  close(angularSeparation(p.jupiter.ra, p.jupiter.dec, p.saturn.ra, p.saturn.dec), 0.1, 0.1, 'separation');
  // 0°29′ into Aquarius
  close(eclipticLongitude(p.jupiter, T), 300.48, 0.2, 'Jupiter longitude');
  close(eclipticLongitude(p.saturn, T), 300.48, 0.2, 'Saturn longitude');
});

test('Mars is opposite the Sun at its 2020 opposition and shines at about −2.6', () => {
  const T = T_at('2020-10-13T23:19:00Z');
  const mars = planetPositions(T).mars;
  const sun = sunPosition(T);
  close(normalizeSignedDegrees(eclipticLongitude(mars, T) - (sun.lambda + 180)), 0, 0.1, 'opposition');
  close(mars.mag, -2.6, 0.15, 'magnitude');
});

test('Venus and Mercury reach their known greatest elongations', () => {
  let T = T_at('2020-03-24T12:00:00Z');
  let sun = sunPosition(T);
  let p = planetPositions(T);
  close(angularSeparation(p.venus.ra, p.venus.dec, sun.ra, sun.dec), 46.1, 0.4, 'Venus 2020-03-24');
  close(p.venus.mag, -4.4, 0.15, 'Venus magnitude');

  T = T_at('2022-01-07T12:00:00Z');
  sun = sunPosition(T);
  p = planetPositions(T);
  close(angularSeparation(p.mercury.ra, p.mercury.dec, sun.ra, sun.dec), 19.2, 0.4, 'Mercury 2022-01-07');
});

test('outer planets sit opposite the Sun at their 2023 oppositions (loose: ≤ 0.4°)', () => {
  for (const [id, iso, mag] of [
    ['jupiter', '2023-11-03T09:00:00Z', -2.9],
    ['saturn', '2023-08-27T12:00:00Z', 0.4],
  ] as const) {
    const T = T_at(iso);
    const sun = sunPosition(T);
    const planet = planetPositions(T)[id];
    close(normalizeSignedDegrees(eclipticLongitude(planet, T) - (sun.lambda + 180)), 0, 0.4, `${id} opposition`);
    if (id === 'jupiter') close(planet.mag, mag, 0.2, 'Jupiter magnitude');
  }
});
