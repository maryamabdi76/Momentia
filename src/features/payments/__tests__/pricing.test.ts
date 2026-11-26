import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_UNIT_TOMAN,
  covers,
  normalizeFeatures,
  priceToman,
  quote,
} from '../lib/pricing.ts';
import { signPremiumToken, verifyPremiumToken } from '../lib/token.ts';
import { paidFeatures, readPremiumToken } from '../lib/client.ts';
import { premiumFeaturesOf } from '../../poster/lib/premium-features.ts';

const SECRET = 'x'.repeat(40);
const ID = 'aB3xY9Qw2Zk7Lm4P';
const U = DEFAULT_UNIT_TOMAN;

test('prices: sky 30k, moon 30k, map 45k, +15k for each sky option', () => {
  assert.equal(U, 15_000);
  assert.equal(priceToman('sky', []), 30_000);
  assert.equal(priceToman('sky', ['fullTemplate']), 45_000);
  assert.equal(priceToman('sky', ['paintedConstellations']), 45_000);
  assert.equal(priceToman('sky', ['fullTemplate', 'paintedConstellations']), 60_000);
  assert.equal(priceToman('moon', []), 30_000);
  assert.equal(priceToman('map', []), 45_000);
});

test('prices are always whole multiples of the unit, whatever the unit is', () => {
  for (const unit of [15_000, 20_000]) {
    for (const p of ['sky', 'moon', 'map'] as const) {
      assert.equal(priceToman(p, ['fullTemplate', 'paintedConstellations'], unit) % unit, 0);
    }
  }
});

test('options that do not belong to a product, unknown ones and repeats cost nothing', () => {
  assert.deepEqual(normalizeFeatures('moon', ['fullTemplate']), []);
  assert.deepEqual(normalizeFeatures('map', ['paintedConstellations']), []);
  assert.deepEqual(normalizeFeatures('sky', ['x', 'fullTemplate', 'fullTemplate']), ['fullTemplate']);
  assert.deepEqual(normalizeFeatures('sky', 'fullTemplate'), []);
  assert.equal(priceToman('moon', ['fullTemplate']), 30_000);
});

test('a new option after paying costs only the difference, and nothing if already covered', () => {
  assert.deepEqual(quote('sky', [], null), { amountToman: 30_000, covered: [] });
  assert.deepEqual(quote('sky', ['fullTemplate'], []), {
    amountToman: 15_000,
    covered: ['fullTemplate'],
  });
  // paid with one option, now wants both: one more unit; the new payment covers both
  assert.deepEqual(quote('sky', ['paintedConstellations'], ['fullTemplate']), {
    amountToman: 15_000,
    covered: ['fullTemplate', 'paintedConstellations'],
  });
  assert.equal(quote('sky', ['fullTemplate'], ['fullTemplate']).amountToman, 0);
  assert.equal(quote('sky', [], ['fullTemplate', 'paintedConstellations']).amountToman, 0);
});

test('a payment covers the options it was made with, not others', () => {
  assert.equal(covers(['fullTemplate'], []), true);
  assert.equal(covers(['fullTemplate'], ['fullTemplate']), true);
  assert.equal(covers([], ['fullTemplate']), false);
  assert.equal(covers(['fullTemplate'], ['paintedConstellations']), false);
});

test('the token says which product and options were paid, and only that', () => {
  const token = signPremiumToken(ID, SECRET, { product: 'sky', features: ['fullTemplate'] });
  assert.deepEqual(verifyPremiumToken(token, SECRET), {
    reference: ID,
    product: 'sky',
    features: ['fullTemplate'],
  });
  // a moon token carries no sky options even if some were passed in
  const moon = signPremiumToken(ID, SECRET, { product: 'moon', features: ['fullTemplate'] });
  assert.deepEqual(verifyPremiumToken(moon, SECRET)?.features, []);
  assert.equal(verifyPremiumToken(moon, SECRET)?.product, 'moon');
});

test('a token with no product (from before per-product prices) is rejected', () => {
  const payload = Buffer.from(JSON.stringify({ a: ID, e: Date.now() + 60_000 })).toString(
    'base64url',
  );
  const { createHmac } = require_crypto();
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  assert.equal(verifyPremiumToken(`${payload}.${sig}`, SECRET), null);
});

test('the browser reads what a token paid for; no token or another product gives nothing', () => {
  assert.equal(readPremiumToken('moon'), null); // no sessionStorage here
  assert.equal(paidFeatures('moon'), null);
});

test('sky poster options map to payable options', () => {
  assert.deepEqual(premiumFeaturesOf({ template: 'circle' as never }), []);
  assert.deepEqual(
    premiumFeaturesOf({ template: 'circle' as never, layers: { constellationArt: true } }),
    ['paintedConstellations'],
  );
  assert.deepEqual(
    premiumFeaturesOf({ template: 'full' as never, layers: { constellationArt: true } }),
    ['fullTemplate', 'paintedConstellations'],
  );
});

function require_crypto() {
  // node:crypto without a top-level import keeps the test list above readable
  return process.getBuiltinModule('node:crypto');
}

test('a smaller payment never replaces a bigger one already in the browser', async () => {
  const memory = new Map<string, string>();
  const g = globalThis as unknown as Record<string, unknown>;
  g.sessionStorage = {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  };
  g.window = { dispatchEvent: () => true, addEventListener() {}, removeEventListener() {} };
  const { storePremiumToken } = await import('../lib/client.ts');
  const both = signPremiumToken(ID, SECRET, {
    product: 'sky',
    features: ['fullTemplate', 'paintedConstellations'],
  });
  const none = signPremiumToken(ID, SECRET, { product: 'sky', features: [] });
  storePremiumToken('sky', both);
  storePremiumToken('sky', none); // e.g. an old order typed into /track
  assert.deepEqual(paidFeatures('sky'), ['fullTemplate', 'paintedConstellations']);
  // a bigger one does replace a smaller one
  memory.clear();
  storePremiumToken('sky', none);
  storePremiumToken('sky', both);
  assert.deepEqual(paidFeatures('sky'), ['fullTemplate', 'paintedConstellations']);
  // and tokens of other products are kept apart
  assert.equal(paidFeatures('moon'), null);
});
