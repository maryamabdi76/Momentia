import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeGift,
  encodeGift,
  encodeGiftLegacy,
  giftUrl,
  packJson,
  packedGiftUrl,
  readGiftHash,
  readGiftToken,
  unpackJson,
} from '../lib/gift-link.ts';
import type { PosterDraft } from '../lib/draft.ts';

const draft = {
  moment: {
    city: 'تهران',
    timezone: 'Asia/Tehran',
    day: '30',
    month: 'آذر',
    year: '1405',
    time: '21:00',
    noExactTime: false,
  },
  personal: {
    title: 'بلندترین شب، کنار تو',
    names: 'شیرین و فرهاد',
    quote: 'از آن شب، هر ستاره نشانی از توست.',
    style: 'gold',
    template: 'full',
    showDate: true,
    showCity: true,
    layers: {
      constellationLines: true,
      constellationArt: false,
      moonAndPlanets: true,
      planetNames: false,
      ecliptic: false,
      equator: false,
      maxMagnitude: 4.5,
    },
  },
} as unknown as PosterDraft;

test('a poster survives the round trip through a gift link, Persian text included', () => {
  assert.deepEqual(decodeGift(encodeGift(draft)), draft);
});

test('the link carries the poster in the fragment, never the query', () => {
  const url = new URL(giftUrl('https://example.ir', draft));
  assert.equal(url.pathname, '/gift');
  assert.equal(url.search, '');
  assert.deepEqual(readGiftHash(url.hash), draft);
});

test('garbage and tampered links give null instead of throwing', () => {
  assert.equal(readGiftHash(''), null);
  assert.equal(readGiftHash('#g='), null);
  assert.equal(readGiftHash('#g=%%%'), null);
  assert.equal(decodeGift('not-base64-json'), null);
  const wrongShape = encodeGift({ moment: {}, personal: {} } as unknown as PosterDraft);
  assert.equal(decodeGift(wrongShape), null);
  const badStyle = encodeGift({
    ...draft,
    personal: { ...draft.personal, style: 'neon' },
  } as unknown as PosterDraft);
  assert.equal(decodeGift(badStyle), null);
});

test('the compact link is much shorter than the old one, and old links still open', () => {
  const short = encodeGift(draft);
  const long = encodeGiftLegacy(draft);
  assert.ok(short.length < long.length * 0.6, `${short.length} vs ${long.length}`);
  assert.deepEqual(decodeGift(long), draft);
});

test('a choice nobody defined is refused, not guessed', () => {
  const next = { ...draft, personal: { ...draft.personal, frame: 'aurora' } } as unknown as PosterDraft;
  assert.equal(decodeGift(encodeGift(next)), null);
});

test('a packed value survives the trip, and a damaged token is null', () => {
  const value = { a: 'سلام', b: [1, 2, 3], c: null };
  assert.deepEqual(unpackJson(packJson(value)), value);
  assert.equal(unpackJson('1.@@@'), null);
  assert.equal(unpackJson('nope'), null);
});

test('a gift link says which poster it carries', () => {
  const sky = readGiftToken('#g=abc');
  assert.deepEqual(sky, { product: 'sky', token: 'abc' });
  const moon = packedGiftUrl('https://x.test', 'moon', { z: 1 });
  assert.equal(readGiftToken(moon.slice(moon.indexOf('#')))?.product, 'moon');
  const map = packedGiftUrl('https://x.test', 'map', { z: 1 });
  assert.equal(readGiftToken(map.slice(map.indexOf('#')))?.product, 'map');
  assert.equal(readGiftToken(''), null);
  assert.equal(readGiftToken('#other=1'), null);
});
