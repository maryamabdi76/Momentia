import test from 'node:test';
import assert from 'node:assert/strict';
import { editUrl, readEditHash, giftUrl, readGiftHash } from '../lib/gift-link.ts';
import { shareLink } from '../lib/share-links.ts';
import { YALDA_FIELDS, isYaldaPreset } from '../lib/presets.ts';
import { gregorianToJalali } from '../lib/jalali.ts';
import { JALALI_MONTHS, jalaliFieldsFromIso } from '../lib/calendar.ts';

test('share links carry the message and the gift link, encoded', () => {
  const url = 'https://example.com/gift#abc=1&x';
  const tg = shareLink('telegram', 'سلام', url);
  assert.ok(tg.startsWith('https://t.me/share/url?'));
  assert.ok(tg.includes(encodeURIComponent(url)) && tg.includes(encodeURIComponent('سلام')));
  const wa = shareLink('whatsapp', 'سلام', url);
  assert.ok(wa.startsWith('https://wa.me/?text='));
  assert.ok(wa.includes(encodeURIComponent(url)));
});

test('the Yalda preset is 30 Azar 1405, which is 21 December 2026', () => {
  const j = gregorianToJalali(2026, 12, 21);
  assert.deepEqual(
    { day: String(j.day), month: JALALI_MONTHS[j.month - 1], year: String(j.year) },
    YALDA_FIELDS,
  );
  assert.equal(isYaldaPreset('yalda'), true);
  assert.equal(isYaldaPreset('nowruz'), false);
  assert.equal(isYaldaPreset(null), false);
});

test('a Gregorian date from the date input becomes the Jalali form fields', () => {
  assert.deepEqual(jalaliFieldsFromIso('2026-12-21', gregorianToJalali), YALDA_FIELDS);
  assert.equal(jalaliFieldsFromIso('', gregorianToJalali), null);
  assert.equal(jalaliFieldsFromIso('2026-13-40x', gregorianToJalali), null);
  assert.equal(jalaliFieldsFromIso('1800-01-01', gregorianToJalali), null, 'before the picker range');
});

test('an edit link brings the same draft back, and is not mistaken for a gift link', () => {
  const draft = {
    moment: { city: 'تهران', timezone: 'Asia/Tehran', day: '30', month: 'آذر', year: '1405', time: '21:00', noExactTime: false },
    personal: { title: 'a', names: 'b', quote: 'c', style: 'gold', template: 'circle', showDate: true, showCity: true },
  };
  const url = editUrl('https://x.test', draft as never);
  assert.ok(url.startsWith('https://x.test/create#e='));
  const back = readEditHash(url.slice(url.indexOf('#')));
  assert.equal(back?.personal.names, 'b');
  assert.equal(readEditHash(giftUrl('https://x.test', draft as never).slice(giftUrl('https://x.test', draft as never).indexOf('#'))), null);
  assert.equal(readGiftHash(url.slice(url.indexOf('#'))), null);
  assert.equal(readEditHash(''), null);
});
