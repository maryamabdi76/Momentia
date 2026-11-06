import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OCCASION_SLUGS, isOccasionSlug } from '../lib/occasions.ts';

const fa = JSON.parse(readFileSync(new URL('../../../../messages/fa.json', import.meta.url), 'utf8'));

test('every occasion has a landing page text and a ready-made start', () => {
  assert.ok(OCCASION_SLUGS.length >= 3);
  for (const slug of OCCASION_SLUGS) {
    const o = fa.Occasions[slug];
    for (const key of ['label', 'metaTitle', 'metaDescription', 'eyebrow', 'title', 'body', 'presetTitle', 'presetNames', 'presetQuote']) {
      assert.ok(typeof o[key] === 'string' && o[key].length > 0, `${slug}.${key}`);
    }
    assert.equal(o.ideas.length, 3, `${slug} has three ideas`);
    assert.ok(o.metaDescription.length <= 160, `${slug}: description fits a search result`);
  }
});

test('only known occasions are accepted from a link', () => {
  assert.equal(isOccasionSlug('birthday'), true);
  assert.equal(isOccasionSlug('__proto__'), false);
  assert.equal(isOccasionSlug(null), false);
});
