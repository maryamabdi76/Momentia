import test from 'node:test';
import assert from 'node:assert/strict';
import { TESTIMONIALS } from '../lib/testimonials.ts';

test('every testimonial on the site has its owner\'s consent and a name', () => {
  for (const item of TESTIMONIALS) {
    assert.equal(item.consent, true);
    assert.ok(item.quote.trim().length > 0 && item.who.trim().length > 0);
  }
});
