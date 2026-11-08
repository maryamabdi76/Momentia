import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTreasureMapSvg, placeMilestones, titleFontSize } from '../lib/map-svg.ts';
import { createProjection, spreadPins, smoothOpenPath } from '../lib/map-geometry.ts';

const labels = {
  kicker: 'نقشهٔ گنج',
  count: '۳ لحظه',
  watermark: 'آسمان شب ما',
  alt: 'نقشه',
  north: 'ش',
};
const data = {
  scope: 'iran' as const,
  area: 'تهران',
  theme: 'paper' as const,
  shape: 'circle' as const,
  title: 'قصهٔ ما',
  names: 'شیرین و فرهاد',
  milestones: [
    { title: 'اولین قرار', city: 'تهران', date: '14 مهر 1398' },
    { title: 'خواستگاری', city: 'شیراز', date: '' },
    { title: 'عروسی', city: 'اصفهان', date: '20 شهریور 1400' },
  ],
};

test('builds one pin and one legend row per known city', () => {
  const svg = buildTreasureMapSvg({ data, labels, watermark: true });
  assert.equal((svg.match(/r="15"/g) ?? []).length, 3);
  assert.match(svg, /اولین قرار/);
  assert.match(svg, /۱۴ مهر ۱۳۹۸/);
});

test('premium file has no watermark, free preview has', () => {
  assert.match(buildTreasureMapSvg({ data, labels, watermark: true }), /آسمان شب ما/);
  assert.doesNotMatch(buildTreasureMapSvg({ data, labels, watermark: false }), /آسمان شب ما/);
});

test('city map: draws pins at the given places, with the city name and coordinates', () => {
  const city = {
    ...data,
    scope: 'city' as const,
    milestones: data.milestones.map((m, i) => ({ ...m, city: ['کافه نادری', 'پارک ملت', 'برج میلاد'][i]! })),
  };
  const svg = buildTreasureMapSvg({ data: city, labels, watermark: false });
  assert.equal((svg.match(/r="15"/g) ?? []).length, 3);
  assert.match(svg, /پارک ملت/);
  assert.match(svg, /۳۵٫۶۹°N/);
  assert.equal(svg, buildTreasureMapSvg({ data: city, labels, watermark: false }));
});

test('heart cut draws a heart outline and still keeps every pin inside the picture', () => {
  const svg = buildTreasureMapSvg({ data: { ...data, scope: 'city', shape: 'heart', milestones: data.milestones.map((m) => ({ ...m, city: 'خانه' })) }, labels, watermark: false });
  assert.match(svg, /C/);
  assert.equal((svg.match(/r="15"/g) ?? []).length, 3);
  for (const m of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="15"/g)) {
    assert.ok(Number(m[1]) > 150 && Number(m[1]) < 750 && Number(m[2]) > 300 && Number(m[2]) < 940);
  }
});

test('the heading has no letter-spacing, which breaks joined letters', () => {
  assert.doesNotMatch(buildTreasureMapSvg({ data, labels, watermark: false }), /letter-spacing/);
});

test('night theme changes the colours only', () => {
  const night = buildTreasureMapSvg({ data: { ...data, theme: 'night' }, labels, watermark: false });
  assert.match(night, /#0c142b/);
  assert.doesNotMatch(buildTreasureMapSvg({ data, labels, watermark: false }), /#0c142b/);
});

test('escapes user text', () => {
  const svg = buildTreasureMapSvg({
    data: { ...data, title: '<script>"&' },
    labels,
    watermark: false,
  });
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;&quot;&amp;/);
});

test('unknown cities are skipped, extras beyond 8 are dropped', () => {
  const many = Array.from({ length: 10 }, () => ({ title: 'x', city: 'تهران', date: '' }));
  assert.equal(placeMilestones(many).length, 8);
  assert.equal(placeMilestones([{ title: 'x', city: 'جایی نیست', date: '' }]).length, 0);
});

test('projection puts north above south and east right of west, inside the box', () => {
  const box = { x: 0, y: 0, width: 700, height: 600 };
  const p = createProjection(box);
  const tehran = p(51.39, 35.69);
  const shiraz = p(52.58, 29.59);
  assert.ok(tehran.y < shiraz.y);
  const tabriz = p(46.29, 38.08);
  const mashhad = p(59.6, 36.3);
  assert.ok(tabriz.x < mashhad.x);
  for (const pt of [tehran, shiraz, tabriz, mashhad]) {
    assert.ok(pt.x > 0 && pt.x < 700 && pt.y > 0 && pt.y < 600);
  }
});

test('pins in the same city are fanned out, others stay put', () => {
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
