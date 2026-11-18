import test from 'node:test';
import assert from 'node:assert/strict';
import { mapGiftUrl, readMapGift } from '../lib/gift-link.ts';

const map = {
  title: 'قصهٔ ما',
  names: 'شیرین و فرهاد',
  layout: 'road',
  scope: 'city',
  area: 'تهران',
  theme: 'ink',
  shape: 'circle',
  frame: 'minimal',
  showArea: false,
  showCoords: true,
  milestones: [
    { title: 'اولین قرار', city: 'کافه', date: '۱۴ مهر', art: 'cafe' },
    { title: 'خواستگاری', city: '', date: '', art: 'ring' },
  ],
};
const hashOf = (url: string) => url.slice(url.indexOf('#'));

test('a map link opens as the same map', () => {
  const got = readMapGift(hashOf(mapGiftUrl('https://x.test', map)));
  assert.ok(got);
  assert.equal(got.theme, 'ink');
  assert.equal(got.showArea, false);
  assert.equal(got.showCoords, true);
  assert.deepEqual(
    got.milestones.map((m) => [m.title, m.art]),
    [['اولین قرار', 'cafe'], ['خواستگاری', 'ring']],
  );
});

test('a damaged or foreign map link is null, and a bad value is repaired, not trusted', () => {
  assert.equal(readMapGift('#t=1.@@@'), null);
  assert.equal(readMapGift('#g=abc'), null);
  assert.equal(readMapGift(''), null);
  const bad = readMapGift(hashOf(mapGiftUrl('https://x.test', { ...map, theme: 'neon', title: 'x'.repeat(500) })));
  assert.ok(bad);
  assert.equal(bad.theme, 'paper');
  assert.ok(bad.title.length <= 40);
  // one moment is not a map
  assert.equal(readMapGift(hashOf(mapGiftUrl('https://x.test', { ...map, milestones: [map.milestones[0]] }))), null);
});
