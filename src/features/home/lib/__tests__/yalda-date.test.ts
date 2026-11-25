import test from 'node:test';
import assert from 'node:assert/strict';
import { YALDA_AT, isYaldaCampaign } from '../yalda-date.ts';

test('Yalda is 21:00 on 30 Azar 1405 in Tehran', () => {
  const tehran = new Date(YALDA_AT + 3.5 * 60 * 60 * 1000);
  assert.equal(tehran.toISOString().slice(0, 16), '2026-12-21T21:00');
});

test('the campaign shows before Yalda and a day after, then stops', () => {
  assert.equal(isYaldaCampaign(Date.UTC(2026, 10, 25)), true);
  assert.equal(isYaldaCampaign(YALDA_AT), true);
  assert.equal(isYaldaCampaign(YALDA_AT + 23 * 60 * 60 * 1000), true);
  assert.equal(isYaldaCampaign(YALDA_AT + 25 * 60 * 60 * 1000), false);
});
