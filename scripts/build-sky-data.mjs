#!/usr/bin/env node
/**
 * Builds the compact star catalog and constellation figures used by the sky
 * chart from d3-celestial's GeoJSON data (BSD-3-Clause, built on XHIP).
 *
 *   git clone --depth 1 https://github.com/ofrohn/d3-celestial /tmp/d3-celestial
 *   node scripts/build-sky-data.mjs /tmp/d3-celestial/data
 *
 * Output (committed, so the app never needs the network or this script):
 *   src/features/sky/data/stars.json               [ra, dec, mag, B−V] J2000 degrees
 *   src/features/sky/data/constellation-lines.json figure polylines as [ra, dec]
 *
 * d3-celestial stores longitude in −180…180 (RA wrapped), so RA = lon < 0 ? lon + 360 : lon.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_MAG = 5.5;
const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/build-sky-data.mjs <path to d3-celestial/data>');
  process.exit(1);
}
const out = new URL('../src/features/sky/data/', import.meta.url);
mkdirSync(out, { recursive: true });

const read = (name) => JSON.parse(readFileSync(join(src, name), 'utf8'));
const fail = (msg) => {
  console.error(`Unexpected data format: ${msg}`);
  process.exit(1);
};
const round = (n, d) => Number(n.toFixed(d));
const toRa = (lon) => round(lon < 0 ? lon + 360 : lon, 2);

// ── stars ────────────────────────────────────────────────────────────────────
const starsGeo = read('stars.6.json');
if (starsGeo.type !== 'FeatureCollection' || !Array.isArray(starsGeo.features)) fail('stars.6.json');

const stars = [];
for (const f of starsGeo.features) {
  const [lon, lat] = f.geometry?.coordinates ?? [];
  const mag = Number(f.properties?.mag);
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || !Number.isFinite(mag)) fail(`star ${f.id}`);
  if (mag > LIMIT_MAG) continue;
  const bv = Number.parseFloat(f.properties?.bv);
  stars.push([toRa(lon), round(lat, 2), round(mag, 2), Number.isFinite(bv) ? round(bv, 2) : 0.6]);
}
stars.sort((a, b) => a[2] - b[2]); // brightest first
if (stars.length < 2000) fail(`only ${stars.length} stars survived the cut`);

// ── constellation figures ────────────────────────────────────────────────────
const linesGeo = read('constellations.lines.json');
if (!Array.isArray(linesGeo.features)) fail('constellations.lines.json');

const lines = [];
for (const f of linesGeo.features) {
  if (f.geometry?.type !== 'MultiLineString') fail(`geometry of ${f.id}`);
  const paths = f.geometry.coordinates.map((path) =>
    path.map(([lon, lat]) => [toRa(lon), round(lat, 2)]),
  );
  lines.push({ id: String(f.id), paths });
}
if (lines.length !== 89) fail(`expected 89 constellations, got ${lines.length}`);

writeFileSync(new URL('stars.json', out), JSON.stringify({ limitMagnitude: LIMIT_MAG, stars }));
writeFileSync(new URL('constellation-lines.json', out), JSON.stringify({ lines }));
console.log(`stars: ${stars.length} (mag ≤ ${LIMIT_MAG}), constellations: ${lines.length}`);
