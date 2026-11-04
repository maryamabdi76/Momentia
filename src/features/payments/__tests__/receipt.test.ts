import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentCodeFromToken } from '../lib/client.ts';
import { signPremiumToken } from '../lib/token.ts';

const SECRET = 'x'.repeat(40);
const ORDER_ID = 'aB3xY9Qw2Zk7Lm4P';

test('receipt: the tracking code is the order id inside a signed token', () => {
  assert.equal(paymentCodeFromToken(signPremiumToken(ORDER_ID, SECRET)), ORDER_ID);
});

test('receipt: no token, garbage, or a payload that is not an order id gives no code', () => {
  assert.equal(paymentCodeFromToken(null), null);
  assert.equal(paymentCodeFromToken(''), null);
  assert.equal(paymentCodeFromToken('not-a-token'), null);
  assert.equal(paymentCodeFromToken('%%%.sig'), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('<script>alert(1)</script>', SECRET)), null);
  assert.equal(paymentCodeFromToken(signPremiumToken('abc', SECRET)), null);
});
