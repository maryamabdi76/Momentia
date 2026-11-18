import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitFont } from '../lib/fit-text.ts';
import { mapProblems } from '../lib/problems.ts';
import { sanitizeMap, MAX_LENGTH } from '../lib/sanitize.ts';
import { MAP_LAYOUTS, MAP_THEMES, buildTreasureMapSvg, type TreasureMapData } from '../lib/map-svg.ts';

const labels = { count: '', watermark: 'آسمان شب ما', credit: '© OSM', alt: 'نقشه', iran: 'ایران', north: 'ش' };
const base: TreasureMapData = {
  title: 'عنوان',
  names: 'شیرین و فرهاد',
  layout: 'single',
  scope: 'city',
  area: 'تهران',
  theme: 'paper',
  shape: 'circle',
  frame: 'minimal',
  milestones: [
    { title: 'الف', city: 'ب', date: 'پ', lat: 35.7, lon: 51.4 },
    { title: 'ت', city: 'ث', date: 'ج', lat: 35.71, lon: 51.41 },
  ],
};

test('fitFont keeps short text at its size and shrinks long text to fit', () => {
  assert.equal(fitFont('کافه', 28, 300), 28);
  assert.equal(fitFont('', 28, 300), 28);
  const long = fitFont('ا'.repeat(24), 28, 300);
  assert.ok(long < 28 && long >= 11);
  assert.ok(24 * 0.56 * long <= 300 + 0.5, 'the shrunk text fits');
  assert.equal(fitFont('ا'.repeat(200), 28, 300), 11, 'never below the floor');
});

test('mapProblems names what stops a map', () => {
  const placed = { lat: 1, lon: 1 };
  assert.deepEqual(mapProblems({ layout: 'road', milestones: [{}, {}] }), []);
  assert.deepEqual(mapProblems({ layout: 'road', milestones: [{}] }), ['tooFew']);
  assert.deepEqual(mapProblems({ layout: 'cards', milestones: Array(5).fill(placed) }), ['tooMany']);
  assert.deepEqual(mapProblems({ layout: 'single', milestones: [placed, {}] }), ['needPlaces']);
  assert.deepEqual(mapProblems({ layout: 'cards', milestones: Array(6).fill({}) }), ['tooMany', 'needPlaces']);
  assert.deepEqual(mapProblems({ layout: 'single', milestones: [placed, placed] }), []);
});

test('sanitizeMap repairs a damaged or old save instead of discarding it', () => {
  assert.equal(sanitizeMap(null), null);
  assert.equal(sanitizeMap('x'), null);
  assert.equal(sanitizeMap([]), null);
  assert.equal(sanitizeMap({ milestones: [{ title: 'a' }] }), null, 'one moment is not a map');

  const fixed = sanitizeMap({
    title: `  ${'ع'.repeat(80)}  `,
    names: 5,
    layout: 'gone',
    theme: 'neon',
    area: 'Atlantis',
    frame: 'wavy',
    milestones: [
      { title: 'الف\n\n  ب', city: 'x', date: '1', lat: 35.7, lon: 51.4, icon: 'nope', art: 'cafe' },
      { title: 'ت', lat: 'north', lon: 51.4 },
      { title: 'ث', lat: 95, lon: 10 },
      'junk',
      null,
    ],
  });
  assert.ok(fixed);
  assert.equal(fixed.title.length, MAX_LENGTH.title);
  assert.equal(fixed.names, '');
  assert.equal(fixed.layout, 'single');
  assert.equal(fixed.theme, 'paper');
  assert.equal(fixed.area, 'تهران');
  assert.equal(fixed.frame, 'minimal');
  assert.equal(fixed.milestones.length, 3, 'only real moments are kept');
  assert.equal(fixed.milestones[0]!.title, 'الف ب', 'line breaks and runs of spaces become one space');
  assert.equal(fixed.milestones[0]!.art, 'cafe');
  assert.equal(fixed.milestones[0]!.icon, undefined);
  assert.equal(fixed.milestones[1]!.lat, undefined, 'a half-given place loses both coordinates');
  assert.equal(fixed.milestones[1]!.lon, undefined);
  assert.equal(fixed.milestones[2]!.lat, undefined, 'out of range');
});

test('sanitizeMap keeps no more moments than the layout has room for', () => {
  const eight = Array.from({ length: 8 }, (_, i) => ({ title: String(i), city: '', date: '' }));
  assert.equal(sanitizeMap({ layout: 'road', milestones: eight })!.milestones.length, 8);
  assert.equal(sanitizeMap({ layout: 'cards', milestones: eight })!.milestones.length, 4);
});

test('whatever is typed, no layout and theme writes markup or empty text into the picture', () => {
  const nasty = ['<script>alert(1)</script>', '"><img src=x onerror=1>', "a&b<c>'d\"", '😀'.repeat(10), 'ا'.repeat(40)];
  for (const layout of MAP_LAYOUTS) {
    for (const theme of MAP_THEMES) {
      for (const s of nasty) {
        const milestones = Array.from({ length: layout === 'cards' ? 4 : 8 }, () => ({
          title: s.slice(0, 24),
          city: s.slice(0, 22),
          date: s.slice(0, 18),
          lat: 35.7,
          lon: 51.4,
          art: 'cafe' as const,
        }));
        const svg = buildTreasureMapSvg({ data: { ...base, layout, theme, title: s.slice(0, 40), names: s.slice(0, 40), milestones }, labels, watermark: true });
        assert.ok(!svg.includes('<script') && !svg.includes('<img'), `${layout}/${theme}: markup got through`);
        assert.ok(!/<text [^>]*>\s*<\/text>/.test(svg), `${layout}/${theme}: empty text`);
        assert.ok(!svg.includes('NaN') && !svg.includes('undefined') && !svg.includes('Infinity'), `${layout}/${theme}: bad number`);
      }
    }
  }
});

test('older drafts without the two switches keep the name and hide the coordinates', () => {
  const m = sanitizeMap({ milestones: [{ title: 'a', lat: 35.7, lon: 51.4 }, { title: 'b', lat: 35.6, lon: 51.3 }] });
  assert.equal(m?.showArea, true);
  assert.equal(m?.showCoords, false);
  const off = sanitizeMap({ showArea: false, showCoords: true, milestones: [{ title: 'a' }, { title: 'b' }] });
  assert.equal(off?.showArea, false);
  assert.equal(off?.showCoords, true);
});
