import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsKm, frameView, fromMeters, lonLatToWorld, projectToPoster, toMeters, viewBounds, worldToLonLat } from '../lib/mercator.ts';
import { parseNominatim } from '../lib/places.ts';
import { pickZoom, tilesFor, tileUrl } from '../lib/tiles.ts';

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

test('tiles cover the whole shape, in place, with no gaps', () => {
  const pts = [{ lon: 51.338, lat: 35.6997 }, { lon: 51.3753, lat: 35.7448 }];
  const r = 296;
  const view = frameView(pts, r);
  const c = { x: 450, y: 610 };
  const tiles = tilesFor(view, c, r, 'light');
  assert.ok(tiles.length >= 4 && tiles.length <= 60, `got ${tiles.length}`);
  const size = tiles[0]!.size;
  assert.ok(size > 100 && size <= 257, `tile size ${size}`);
  assert.ok(Math.min(...tiles.map((t) => t.left)) <= c.x - r);
  assert.ok(Math.max(...tiles.map((t) => t.left + t.size)) >= c.x + r);
  assert.ok(Math.min(...tiles.map((t) => t.top)) <= c.y - r);
  assert.ok(Math.max(...tiles.map((t) => t.top + t.size)) >= c.y + r);
  // a pin lands on the tile that should hold it
  const p = projectToPoster(pts[0]!, view, c);
  assert.ok(tiles.some((t) => p.x >= t.left && p.x < t.left + t.size && p.y >= t.top && p.y < t.top + t.size));
});

test('tile urls and zoom', () => {
  assert.equal(tileUrl('dark', 15, 100, 201), 'https://tile.openstreetmap.org/15/100/201.png');
  assert.ok(pickZoom(1500 / 592, 35.7) >= 14 && pickZoom(1500 / 592, 35.7) <= 17);
  assert.equal(pickZoom(0.1, 35.7), 19, 'never deeper than the source has');
  assert.equal(pickZoom(0.1, 35.7, 16), 16);
  assert.equal(pickZoom(1e9, 0), 3);
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
