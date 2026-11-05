import test from 'node:test';
import assert from 'node:assert/strict';
import { shareLink } from '../lib/share-links.ts';
import { YALDA_FIELDS, isYaldaPreset } from '../lib/presets.ts';
import { gregorianToJalali } from '../lib/jalali.ts';
import { JALALI_MONTHS } from '../lib/calendar.ts';

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
