import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentCodeFromToken } from '../lib/client.ts';
import { signPremiumToken } from '../lib/token.ts';

const SECRET = 'x'.repeat(40);
const AUTHORITY = 'A00000000000000000000000000000012345';

test('receipt: the tracking code is the authority inside a signed token', () => {
  assert.equal(paymentCodeFromToken(signPremiumToken(AUTHORITY, SECRET)), AUTHORITY);
});

test('receipt: sandbox authorities work too', () => {
  const sandbox = `S${'1'.repeat(35)}`;
  assert.equal(paymentCodeFromToken(signPremiumToken(sandbox, SECRET)), sandbox);
});

test('receipt: no token, garbage, or a payload that is not an authority gives no code', () => {
  assert.equal(paymentCodeFromToken(null), null);
  assert.equal(paymentCodeFromToken(''), null);
  assert.equal(paymentCodeFromToken('not-a-token'), null);
  assert.equal(paymentCodeFromToken('%%%.sig'), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('<script>alert(1)</script>', SECRET)), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('short', SECRET)), null);
});
