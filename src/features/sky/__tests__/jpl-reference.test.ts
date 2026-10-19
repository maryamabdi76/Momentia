import test from 'node:test';
import assert from 'node:assert/strict';
import { centuriesTT } from '../lib/astro.ts';
import { computeSky } from '../lib/compute.ts';
import { moonPosition, planetPositions, sunPosition } from '../lib/ephemeris.ts';

/**
 * Reference values from NASA JPL Horizons (DE441), queried for the instants
 * below: geocentric apparent RA/Dec, and topocentric airless azimuth/elevation
 * and illuminated fraction for the Moon. They pin the poster's sky to the real
 * one, so a future "improvement" cannot quietly move it.
 */
const separation = (a: [number, number], b: [number, number]) => {
  const r = Math.PI / 180;
  const c =
    Math.sin(a[1] * r) * Math.sin(b[1] * r) +
    Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.cos((a[0] - b[0]) * r);
  return Math.acos(Math.min(1, c)) / r;
};

type Ref = { at: string; ra: number; dec: number; tol: number };
const MOON: Ref[] = [
  { at: '2026-12-21T17:30:00Z', ra: 53.36141, dec: 24.42059, tol: 0.01 },
  { at: '2010-07-15T16:30:00Z', ra: 165.95647, dec: 0.82711, tol: 0.01 },
  { at: '1979-02-11T17:00:00Z', ra: 139.6508, dec: 12.96688, tol: 0.01 },
  { at: '1950-06-01T18:30:00Z', ra: 267.9308, dec: -28.45073, tol: 0.02 },
];

test('Moon position agrees with JPL Horizons within 0.01° (1/50 of its width)', () => {
  for (const { at, ra, dec, tol } of MOON) {
    const m = moonPosition(centuriesTT(new Date(at)));
    const err = separation([m.ra, m.dec], [ra, dec]);
    assert.ok(err <= tol, `${at}: ${err.toFixed(4)}°`);
  }
});

test('Sun at J2000 agrees with JPL Horizons within 0.01°', () => {
  const s = sunPosition(centuriesTT(new Date('2000-01-01T12:00:00Z')));
  assert.ok(separation([s.ra, s.dec], [281.27838, -23.03243]) <= 0.01);
});

const PLANETS: Array<{ at: string; id: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'; ra: number; dec: number }> = [
  { at: '2026-12-21T17:30:00Z', id: 'mercury', ra: 263.0648, dec: -24.13741 },
  { at: '2026-12-21T17:30:00Z', id: 'venus', ra: 222.18611, dec: -12.92135 },
  { at: '2026-12-21T17:30:00Z', id: 'mars', ra: 160.91366, dec: 11.22956 },
  { at: '2026-12-21T17:30:00Z', id: 'jupiter', ra: 149.42865, dec: 13.37984 },
  { at: '2026-12-21T17:30:00Z', id: 'saturn', ra: 8.36698, dec: 0.89048 },
  { at: '1979-02-11T17:00:00Z', id: 'venus', ra: 277.53433, dec: -20.87735 },
  { at: '1979-02-11T17:00:00Z', id: 'mars', ra: 320.05677, dec: -16.6881 },
  { at: '1979-02-11T17:00:00Z', id: 'jupiter', ra: 124.12602, dec: 20.43787 },
  { at: '1979-02-11T17:00:00Z', id: 'saturn', ra: 164.12302, dec: 8.93156 },
];

test('planets agree with JPL Horizons within 0.1° (a tenth of a Moon width is 0.05°)', () => {
  for (const { at, id, ra, dec } of PLANETS) {
    const p = planetPositions(centuriesTT(new Date(at)))[id];
    const err = separation([p.ra, p.dec], [ra, dec]);
    assert.ok(err <= 0.1, `${id} ${at}: ${err.toFixed(4)}°`);
  }
});

test('Moon height, direction and phase seen from the ground agree with JPL Horizons', () => {
  const refs = [
    { at: '2026-12-21T17:30:00Z', lat: 35.69, lon: 51.39, az: 142.420571, alt: 75.991044, illum: 91.89391 },
    { at: '2010-07-15T16:30:00Z', lat: 29.59, lon: 52.58, az: 259.217231, alt: 18.883728, illum: 20.20296 },
    { at: '1995-02-10T19:00:00Z', lat: 38.08, lon: 46.29, az: 236.734718, alt: 61.12093, illum: 78.66569 },
    { at: '1950-06-01T18:30:00Z', lat: 32.65, lon: 51.67, az: 136.963824, alt: 12.179496, illum: 97.28535 },
    { at: '2025-11-20T17:30:00Z', lat: 35.69, lon: 51.39, az: 270.868202, alt: -49.685821, illum: 0 },
  ];
  for (const r of refs) {
    const { moon } = computeSky({
      latitude: r.lat,
      longitude: r.lon,
      date: new Date(r.at),
      catalog: { stars: [], lines: [] },
    });
    assert.ok(Math.abs(moon.altitude - r.alt) <= 0.02, `${r.at} altitude ${moon.altitude} vs ${r.alt}`);
    assert.ok(Math.abs(moon.azimuth - r.az) <= 0.02, `${r.at} azimuth ${moon.azimuth} vs ${r.az}`);
    assert.ok(Math.abs(moon.illumination * 100 - r.illum) <= 0.7, `${r.at} illumination ${moon.illumination * 100} vs ${r.illum}`);
  }
});
