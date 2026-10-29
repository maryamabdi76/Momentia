import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeGift, encodeGift, giftUrl, readGiftHash } from '../lib/gift-link.ts';
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
