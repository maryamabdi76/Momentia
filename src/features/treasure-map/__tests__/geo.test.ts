import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsKm, frameView, fromMeters, lonLatToWorld, projectToPoster, toMeters, viewBounds, worldToLonLat } from '../lib/mercator.ts';
import { buildQuery, parseNominatim, parseOverpass } from '../lib/streets.ts';

const tehran = { lon: 51.39, lat: 35.69 };

test('world pixels and lon/lat convert back and forth', () => {
  for (const z of [3, 12, 17]) {
    const w = lonLatToWorld(tehran, z);
    const back = worldToLonLat(w.x, w.y, z);
    assert.ok(Math.abs(back.lon - tehran.lon) < 1e-9 && Math.abs(back.lat - tehran.lat) < 1e-9);
  }
  assert.deepEqual(lonLatToWorld({ lon: 0, lat: 0 }, 0), { x: 128, y: 128 });
});

test('meters round-trip', () => {
  const m = toMeters(tehran);
  const back = fromMeters(m.x, m.y);
  assert.ok(Math.abs(back.lon - tehran.lon) < 1e-9 && Math.abs(back.lat - tehran.lat) < 1e-9);
});

test('framing keeps every pin inside the middle of the shape, north up', () => {
  const pts = [
    { lon: 51.39, lat: 35.7 },
    { lon: 51.42, lat: 35.72 },
    { lon: 51.4, lat: 35.68 },
  ];
  const r = 296;
  const view = frameView(pts, r);
  const c = { x: 450, y: 610 };
  const xy = pts.map((p) => projectToPoster(p, view, c));
  for (const p of xy) assert.ok(Math.hypot(p.x - c.x, p.y - c.y) < r * 0.85);
  assert.ok(xy[1]!.y < xy[0]!.y, 'further north is higher up');
  assert.ok(xy[1]!.x > xy[0]!.x, 'further east is further right');
});

test('a single place still gets a sensible ~1.5km-wide view', () => {
  const view = frameView([tehran], 296);
  const b = viewBounds(view, 296, 1);
  const km = boundsKm(b);
  assert.ok(km > 1 && km < 3, `got ${km}`);
});

test('overpass answers are sorted into roads, rivers, water and parks; junk is skipped', () => {
  const geom = [{ lat: 35.7, lon: 51.4 }, { lat: 35.701, lon: 51.401 }];
  const d = parseOverpass({
    elements: [
      { type: 'way', tags: { highway: 'primary' }, geometry: geom },
      { type: 'way', tags: { highway: 'residential' }, geometry: geom },
      { type: 'way', tags: { waterway: 'river' }, geometry: geom },
      { type: 'way', tags: { natural: 'water' }, geometry: geom },
      { type: 'way', tags: { leisure: 'park' }, geometry: geom },
      { type: 'way', tags: { highway: 'footway' }, geometry: geom },
      { type: 'node', tags: {}, geometry: geom },
      { type: 'way', tags: { highway: 'primary' }, geometry: [{ lat: 1, lon: 1 }] },
      null,
      { type: 'way', tags: { highway: 'primary' }, geometry: 'nope' },
    ],
  });
  assert.deepEqual([d.major.length, d.minor.length, d.rivers.length, d.water.length, d.parks.length], [1, 1, 1, 1, 1]);
  assert.deepEqual(parseOverpass(null).major, []);
  assert.deepEqual(parseOverpass({ elements: 5 }).minor, []);
});

test('the point budget stops a huge answer', () => {
  const geom = Array.from({ length: 100 }, (_, i) => ({ lat: 35 + i * 1e-4, lon: 51 }));
  const els = Array.from({ length: 50 }, () => ({ type: 'way', tags: { highway: 'primary' }, geometry: geom }));
  assert.ok(parseOverpass({ elements: els }, 1000).major.length <= 10);
});

test('queries ask for the box, and big areas ask for main roads only', () => {
  const b = { south: 35.6, west: 51.3, north: 35.8, east: 51.5 };
  assert.match(buildQuery(b, false), /\(35\.60000,51\.30000,35\.80000,51\.50000\)/);
  assert.match(buildQuery(b, false), /residential/);
  assert.doesNotMatch(buildQuery(b, true), /residential/);
});

test('place search results are shortened to a name', () => {
  const hits = parseNominatim([
    { lat: '35.7', lon: '51.4', name: 'پارک ملت', display_name: 'پارک ملت، تهران، ایران' },
    { lat: 'x', lon: '1', display_name: 'bad' },
    { lat: '35.6', lon: '51.3', display_name: 'کافه نادری، خیابان جمهوری، تهران' },
  ]);
  assert.equal(hits.length, 2);
  assert.equal(hits[0]!.name, 'پارک ملت');
  assert.equal(hits[1]!.name, 'کافه نادری');
});
