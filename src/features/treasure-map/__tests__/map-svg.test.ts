import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTreasureMapSvg, cardSlots, mapAspect, mapTiles, maxMilestones, titleFontSize } from '../lib/map-svg.ts';
import { spreadPins, smoothOpenPath } from '../lib/map-geometry.ts';

const labels = {
  kicker: 'نقشهٔ گنج',
  count: '۳ لحظه',
  watermark: 'آسمان شب ما',
  credit: '© OpenStreetMap',
  alt: 'نقشه',
  north: 'ش',
  iran: 'ایران',
};
const places = [
  { title: 'اولین قرار', city: 'پل طبیعت', date: '14 مهر 1398', lat: 35.7611, lon: 51.4143 },
  { title: 'خواستگاری', city: 'برج آزادی', date: '', lat: 35.6997, lon: 51.338 },
  { title: 'عروسی', city: 'برج میلاد', date: '20 شهریور 1400', lat: 35.7448, lon: 51.3753 },
];
const city = {
  layout: 'single' as const,
  scope: 'city' as const,
  area: 'تهران',
  theme: 'paper' as const,
  shape: 'circle' as const,
  frame: 'minimal' as const,
  title: 'قصهٔ ما',
  names: 'شیرین و فرهاد',
  milestones: places,
};
const iran = {
  ...city,
  scope: 'iran' as const,
  milestones: [
    { title: 'اولین قرار', city: 'تهران', date: '', lat: 35.69, lon: 51.39 },
    { title: 'عروسی', city: 'شیراز', date: '', lat: 29.59, lon: 52.58 },
    { title: 'سفر', city: 'مشهد', date: '', lat: 36.3, lon: 59.6 },
  ],
};
const pinsOf = (svg: string) =>
  [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="15"/g)].map((m) => [Number(m[1]), Number(m[2])] as const);

test('city map: tiles, a pin and a legend row per place, credit, and the OSM base map', () => {
  const svg = buildTreasureMapSvg({ data: city, labels, watermark: true });
  assert.match(svg, /<image href="https:\/\/tile\.openstreetmap\.org\//);
  assert.equal(pinsOf(svg).length, 3);
  assert.match(svg, /پل طبیعت/);
  assert.match(svg, /۱۴ مهر ۱۳۹۸/);
  assert.match(svg, /© OpenStreetMap/);
  assert.match(svg, /feColorMatrix/);
  assert.match(svg, /۳۵٫۷۳°N/);
});

test('pins land where the places are, north up', () => {
  const pins = pinsOf(buildTreasureMapSvg({ data: city, labels, watermark: false }));
  // Tabiat Bridge (1) is north-east of Azadi Tower (2)
  assert.ok(pins[0]![0] > pins[1]![0] && pins[0]![1] < pins[1]![1]);
});

test('Iran map: tiles shown through the outline, pins by their coordinates', () => {
  const svg = buildTreasureMapSvg({ data: iran, labels, watermark: false });
  assert.match(svg, /<clipPath id="tmap-clip"><path d="M/);
  assert.match(svg, /<image href="https:\/\/tile\.openstreetmap\.org\/[56]\//);
  assert.match(svg, /ایران/);
  const [tehran, shiraz, mashhad] = pinsOf(svg);
  assert.ok(tehran![1] < shiraz![1], 'Tehran is north of Shiraz');
  assert.ok(mashhad![0] > tehran![0], 'Mashhad is east of Tehran');
});

test('an Iran map shows its map before any place is picked; a city map waits', () => {
  assert.ok(mapTiles({ ...iran, milestones: [] }).length > 0);
  assert.ok(mapTiles(iran).length >= 4 && mapTiles(iran).length <= 60);
  assert.deepEqual(mapTiles({ ...city, milestones: [{ title: 'x', city: 'y', date: '' }] }), []);
});

test('export swaps each tile for its embedded picture', () => {
  const url = mapTiles(city)[0]!.url;
  const svg = buildTreasureMapSvg({ data: city, labels, watermark: false, tileImages: { [url]: 'data:image/png;base64,AAAA' } });
  assert.match(svg, /href="data:image\/png;base64,AAAA"/);
});

test('premium file has no watermark, free preview has', () => {
  assert.match(buildTreasureMapSvg({ data: city, labels, watermark: true }), /آسمان شب ما/);
  assert.doesNotMatch(buildTreasureMapSvg({ data: city, labels, watermark: false }), /آسمان شب ما/);
});

test('escapes user text', () => {
  const svg = buildTreasureMapSvg({ data: { ...city, title: '<script>"&' }, labels, watermark: false });
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;&quot;&amp;/);
});

test('arch and square cuts keep every pin inside the picture', () => {
  for (const shape of ['arch', 'square'] as const) {
    const svg = buildTreasureMapSvg({ data: { ...city, shape }, labels, watermark: false });
    assert.match(svg, shape === 'arch' ? /<path d="M[\d. ]+V[\d. ]+A/ : /<rect x="[\d. ]+" y="[\d. ]+" width="[\d. ]+" height="[\d. ]+" rx=/);
    for (const [x, y] of pinsOf(svg)) assert.ok(x > 150 && x < 750 && y > 300 && y < 940);
  }
});

test('night uses a light ink on dark paper; paper the other way round', () => {
  const night = buildTreasureMapSvg({ data: { ...city, theme: 'night' }, labels, watermark: false });
  assert.match(night, /#0c142b/);
  const row = (svg: string) => /values="([^"]+)"/.exec(svg)![1]!.split(/\s+/).map(Number);
  const nightRow = row(night);
  const paperRow = row(buildTreasureMapSvg({ data: city, labels, watermark: false }));
  assert.ok(nightRow[0]! < 0, 'darker tile pixels give more ink');
  assert.ok(paperRow[0]! > 0, 'lighter tile pixels give more paper');
});

test('a city map without picked places draws the stylised backdrop, with no credit', () => {
  const svg = buildTreasureMapSvg({ data: { ...city, milestones: places.map(({ title, city: c, date }) => ({ title, city: c, date })) }, labels, watermark: false });
  assert.doesNotMatch(svg, /<image /);
  assert.doesNotMatch(svg, /© OpenStreetMap/);
});

test('the heading has no letter-spacing, which breaks joined letters', () => {
  assert.doesNotMatch(buildTreasureMapSvg({ data: city, labels, watermark: false }), /letter-spacing/);
});

test('pins in the same place are fanned out, others stay put', () => {
  const pts = [{ x: 100, y: 100 }, { x: 100, y: 100 }, { x: 300, y: 300 }];
  const out = spreadPins(pts, ['a', 'a', 'b']);
  assert.notDeepEqual(out[0], out[1]);
  assert.deepEqual(out[2], pts[2]);
});

test('smooth path needs two points and starts at the first', () => {
  assert.equal(smoothOpenPath([{ x: 1, y: 1 }]), '');
  assert.match(smoothOpenPath([{ x: 1, y: 1 }, { x: 5, y: 5 }]), /^M1 1C/);
});

test('long titles get a smaller, but never tiny, font', () => {
  assert.ok(titleFontSize('کوتاه') > titleFontSize('یک عنوان بسیار بسیار بلند برای نقشه'));
  assert.ok(titleFontSize('x'.repeat(200)) >= 40);
});

test('the chosen frame is drawn, and none draws no border', () => {
  const opts = { labels, watermark: false };
  const classic = buildTreasureMapSvg({ ...opts, data: { ...city, frame: 'classic' } });
  const none = buildTreasureMapSvg({ ...opts, data: { ...city, frame: 'none' } });
  const minimal = buildTreasureMapSvg({ ...opts, data: city });
  assert.notEqual(classic, minimal);
  assert.ok(classic.length > none.length);
  assert.ok(minimal.length > none.length);
});

test('cards layout draws one clipped map per moment with its caption', () => {
  const data = { ...city, layout: 'cards' as const, shape: 'arch' as const };
  const svg = buildTreasureMapSvg({ data, labels, watermark: false });
  assert.equal((svg.match(/<clipPath id="tmap-card\d"/g) ?? []).length, 3);
  for (const m of places) assert.ok(svg.includes(m.title) && svg.includes(m.city));
  assert.ok(svg.includes('tile.openstreetmap.org'));
  assert.ok(svg.includes(labels.credit));
});

test('cards sit in one row on a landscape sheet', () => {
  const data = { ...city, layout: 'cards' as const };
  assert.ok(mapTiles(data).length >= 3);
  assert.equal(mapAspect('cards'), 1350 / 900);
  assert.equal(mapAspect('single'), 900 / 1350);
  const svg = buildTreasureMapSvg({ data, labels, watermark: true });
  assert.match(svg, /viewBox="0 0 1350 900"/);
  for (const count of [2, 3, 4]) {
    const slots = cardSlots(count);
    assert.equal(slots.length, count);
    // one row, first moment at the right, nothing off the sheet, no overlaps
    assert.ok(slots.every((c) => c.y === slots[0]!.y));
    for (let i = 1; i < count; i++) assert.ok(slots[i - 1]!.x - slots[i]!.x >= 2 * slots[i]!.r);
    assert.ok(slots.every((c) => c.x - c.r >= 40 && c.x + c.r <= 1310));
  }
  assert.equal(maxMilestones('cards'), 4);
});
