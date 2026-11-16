import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iconMarkup, MAP_ICONS } from '../lib/illustrations.ts';
import { planRoad } from '../lib/road.ts';
import { buildTreasureMapSvg, cardSlots, heartGeometry, mapAspect, mapTiles, maxMilestones, titleFontSize } from '../lib/map-svg.ts';
import { spreadPins, smoothOpenPath } from '../lib/map-geometry.ts';

const labels = {
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

test('heart, arch and square cuts keep every pin inside the picture', () => {
  for (const shape of ['heart', 'arch', 'square'] as const) {
    const svg = buildTreasureMapSvg({ data: { ...city, shape }, labels, watermark: false });
    assert.match(svg, shape === 'heart' ? /<path d="M[\d. ]+L[\d. ]+A/ : shape === 'arch' ? /<path d="M[\d. ]+V[\d. ]+A/ : /<rect x="[\d. ]+" y="[\d. ]+" width="[\d. ]+" height="[\d. ]+" rx=/);
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
  assert.ok(!svg.includes(labels.credit), 'the paid file has no credit line');
  assert.ok(buildTreasureMapSvg({ data, labels, watermark: true }).includes(labels.credit));
});

test('the exported file asks for sharper tiles than the preview (more of them, each smaller)', () => {
  const preview = mapTiles(city);
  const sharp = mapTiles(city, 2);
  assert.ok(sharp.length > preview.length);
  assert.ok(sharp[0]!.size < preview[0]!.size);
  // Iran stays modest
  assert.ok(mapTiles(iran, 2).length <= 120);
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

test('the heart is a classic one: 2s wide and tall, pointed, with the date set along its right side', () => {
  const g = heartGeometry(450, 400, 100);
  // the outline starts at the tip, the lowest point, and ends back there
  assert.ok(g.path.startsWith('M450 500L'));
  assert.ok(g.path.endsWith('Z'));
  assert.ok(g.side.angle < 0 && g.side.angle > -90, 'the side climbs to the right');
  assert.ok(g.side.normal.x > 0 && g.side.normal.y > 0, 'outwards is down and to the right');
  const svg = buildTreasureMapSvg({ data: { ...city, layout: 'cards' as const, shape: 'heart' as const }, labels, watermark: false });
  assert.match(svg, /<text [^>]*transform="rotate\(-[\d.]+ /);
});

test('the illustrated road: a numbered stop, a picture and the words for every moment, no map tiles', () => {
  const data = { ...city, layout: 'road' as const, milestones: places.map((m, i) => ({ title: m.title, city: m.city, date: m.date, icon: (['cafe', 'ring', 'cake'] as const)[i] })) };
  const svg = buildTreasureMapSvg({ data, labels, watermark: false });
  assert.equal(mapTiles(data).length, 0);
  assert.ok(!svg.includes('<image'));
  for (const m of places) assert.ok(svg.includes(m.title) && svg.includes(m.city));
  // the road itself leads from place to place: no numbered badges
  assert.ok(!svg.includes('>۱</text>'));
  assert.match(svg, /<filter id="tmap-wobble"/);
  assert.match(svg, /viewBox="0 0 900 1350"/);
});

test('the road draws a watercolour picture for a moment that has one, linked or embedded, and the drawn icon otherwise', () => {
  const data = {
    ...city,
    layout: 'road' as const,
    milestones: places.map((m, i) => ({ title: m.title, city: m.city, date: m.date, ...(i < 2 ? { art: (['cafe', 'ring'] as const)[i] } : { icon: 'cake' as const }) })),
  };
  const linked = buildTreasureMapSvg({ data, labels, watermark: false });
  assert.equal(linked.match(/<image /g)?.length, 2);
  assert.ok(linked.includes('href="/map-art/cafe.webp"') && linked.includes('href="/map-art/ring.webp"'));
  const embedded = buildTreasureMapSvg({ data, labels, watermark: false, artImages: { cafe: 'data:image/webp;base64,AAA', ring: 'data:image/webp;base64,BBB' } });
  assert.ok(embedded.includes('href="data:image/webp;base64,AAA"') && !embedded.includes('/map-art/'));
  // a light patch only behind pictures on the dark theme
  assert.ok(!linked.includes('#FBF8F1" fill-opacity="0.92"'));
  const dark = buildTreasureMapSvg({ data: { ...data, theme: 'night' as const }, labels, watermark: false });
  assert.equal(dark.match(/fill-opacity="0.92"/g)?.length, 2);
});

test('the ink theme draws pen versions of the pictures on a crisp road with more trees', () => {
  const data = {
    ...city,
    theme: 'ink' as const,
    layout: 'road' as const,
    milestones: places.map((m) => ({ title: m.title, city: m.city, date: m.date, art: 'cafe' as const })),
  };
  const svg = buildTreasureMapSvg({ data, labels, watermark: false });
  assert.ok(svg.includes('href="/map-art/line/cafe.webp"') && !svg.includes('href="/map-art/cafe.webp"'));
  assert.ok(!svg.includes('fill-opacity="0.92"'), 'no dark-theme patch');
  const paper = buildTreasureMapSvg({ data: { ...data, theme: 'paper' as const }, labels, watermark: false });
  assert.ok((svg.match(/<path d="M0-18L-11 2H11Z/g)?.length ?? 0) > (paper.match(/<path d="M0-18L-11 2H11Z/g)?.length ?? 0), 'more trees');
});

test('a map with no title, names, place or date draws no empty text, and has no kicker line', () => {
  for (const layout of ['single', 'cards', 'road'] as const) {
    const data = {
      ...city,
      layout,
      title: '',
      names: '',
      milestones: places.map((m) => ({ title: '', city: '', date: '', lat: m.lat, lon: m.lon, art: 'love' as const })),
    };
    const svg = buildTreasureMapSvg({ data, labels, watermark: false });
    assert.ok(!/<text [^>]*>\s*<\/text>/.test(svg), `${layout}: an empty <text>`);
    assert.ok(!svg.includes('نقشهٔ گنج'), `${layout}: kicker`);
  }
});

test('the road winds across the sheet, in order, and its blocks stay on the page and apart', () => {
  for (const count of [2, 3, 4, 5, 6, 7, 8]) {
    const { stops, road } = planRoad(count);
    assert.equal(stops.length, count);
    assert.ok(road.length > count);
    // the first moment is at the right of the first pass
    assert.ok(stops[0]!.x > 450);
    for (const s of stops) {
      assert.ok(s.px - s.r > 40 && s.px + s.r < 860, 'picture on the page');
      assert.ok(s.py - s.r > 285 && s.bottom < 1275, 'block between the title and the foot');
      assert.equal(s.py, s.y, 'the picture sits on the road');
    }
    // no two pictures overlap
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = stops[i]!;
        const b = stops[j]!;
        assert.ok(Math.hypot(a.px - b.px, a.py - b.py) > a.r + b.r + 20, `${count}: ${i} and ${j} overlap`);
      }
    }
  }
  // the same plan every time, so a poster does not change between renders
  assert.deepEqual(planRoad(5), planRoad(5));
});

test('every illustration is drawn and ready to embed', () => {
  assert.ok(MAP_ICONS.length >= 20);
  const palette = { ink: '#000', card: '#fff', accent: '#f00', land: '#eee', water: '#ccf', park: '#cfc' };
  for (const icon of MAP_ICONS) {
    const markup = iconMarkup(icon, palette);
    assert.ok(markup.startsWith('<') && !/undefined|NaN/.test(markup), icon);
  }
});
