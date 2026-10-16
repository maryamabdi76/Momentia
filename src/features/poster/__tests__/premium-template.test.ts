import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POSTER_TEMPLATES,
  isPremiumTemplate,
} from '../lib/templates.ts';

test('the full-page layout is premium, the round chart is free', () => {
  assert.equal(isPremiumTemplate('full'), true);
  assert.equal(isPremiumTemplate('circle'), false);
});

test('at least one layout stays free', () => {
  assert.ok(POSTER_TEMPLATES.some((t) => !isPremiumTemplate(t)));
});
