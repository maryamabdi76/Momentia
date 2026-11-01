import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentCodeFromToken } from '../lib/client.ts';
import { signPremiumToken } from '../lib/token.ts';

const SECRET = 'x'.repeat(40);
const SLUG = 'aB3xY9kQ';

test('receipt: the tracking code is the Variza slug inside a signed token', () => {
  assert.equal(paymentCodeFromToken(signPremiumToken(SLUG, SECRET)), SLUG);
});

test('receipt: no token, garbage, or a payload that is not a slug gives no code', () => {
  assert.equal(paymentCodeFromToken(null), null);
  assert.equal(paymentCodeFromToken(''), null);
  assert.equal(paymentCodeFromToken('not-a-token'), null);
  assert.equal(paymentCodeFromToken('%%%.sig'), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('<script>alert(1)</script>', SECRET)), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('abc', SECRET)), null);
});
