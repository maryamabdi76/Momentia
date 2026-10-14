import test from 'node:test';
import assert from 'node:assert/strict';
import { readPaymentConfig } from '../lib/config.ts';
import { signPremiumToken, verifyPremiumToken } from '../lib/token.ts';
import { readPendingCookie } from '../lib/cookie.ts';
import {
  requestPayment,
  verifyPayment,
  startPayUrl,
  AUTHORITY_PATTERN,
} from '../lib/zarinpal.ts';
import { formatToman } from '../../poster/lib/digits.ts';

const SECRET = 'x'.repeat(40);
const AUTH = 'A0000000000000000000000000000wwOGYpd';
const cfg = {
  merchantId: '11111111-2222-4333-8444-555555555555',
  sandbox: false,
};

const reply = (body: unknown) =>
  (async () =>
    new Response(JSON.stringify(body), {
      status: 200,
    })) as unknown as typeof fetch;

test('config needs merchant, long secret and a sane price', () => {
  const ok = {
    ZARINPAL_MERCHANT_ID: 'm',
    PAYMENT_TOKEN_SECRET: SECRET,
    PREMIUM_PRICE_IRT: '49000',
  };
  assert.equal(readPaymentConfig(ok)?.amountRial, 490000);
  assert.equal(
    readPaymentConfig({ ...ok, ZARINPAL_SANDBOX: 'true' })?.sandbox,
    true,
  );
  assert.equal(
    readPaymentConfig({ ...ok, PAYMENT_TOKEN_SECRET: 'short' }),
    null,
  );
  assert.equal(readPaymentConfig({ ...ok, PREMIUM_PRICE_IRT: '10' }), null);
  assert.equal(readPaymentConfig({ ...ok, PREMIUM_PRICE_IRT: 'abc' }), null);
  assert.equal(readPaymentConfig({ ...ok, ZARINPAL_MERCHANT_ID: '' }), null);
});

test('premium token round-trips and rejects tampering and expiry', () => {
  const now = 1_000_000;
  const t = signPremiumToken(AUTH, SECRET, now, 5000);
  assert.deepEqual(verifyPremiumToken(t, SECRET, now + 1000), {
    authority: AUTH,
  });
  assert.equal(verifyPremiumToken(t, SECRET, now + 6000), null, 'expired');
  assert.equal(
    verifyPremiumToken(t, 'y'.repeat(40), now),
    null,
    'wrong secret',
  );
  const [payload, sig] = t.split('.');
  const forged = Buffer.from(
    JSON.stringify({ a: AUTH, e: now + 9e9 }),
  ).toString('base64url');
  assert.equal(
    verifyPremiumToken(`${forged}.${sig}`, SECRET, now),
    null,
    'payload swapped',
  );
  assert.equal(verifyPremiumToken(`${payload}.`, SECRET, now), null);
  assert.equal(verifyPremiumToken('garbage', SECRET, now), null);
});

test('pending cookie is read back by name', () => {
  assert.equal(readPendingCookie(`a=1; zp_pending=${AUTH}; b=2`), AUTH);
  assert.equal(readPendingCookie('a=1'), null);
  assert.equal(readPendingCookie(null), null);
});

test('authority pattern accepts live and sandbox ids only', () => {
  assert.ok(AUTHORITY_PATTERN.test(AUTH));
  assert.ok(AUTHORITY_PATTERN.test('S' + AUTH.slice(1)));
  assert.ok(!AUTHORITY_PATTERN.test('B' + AUTH.slice(1)));
  assert.ok(!AUTHORITY_PATTERN.test(AUTH + 'x'));
  assert.ok(!AUTHORITY_PATTERN.test('../../etc'));
});

test('requestPayment sends rials and returns the authority', async () => {
  let sent: { url: string; body: Record<string, unknown> } | null = null;
  const fetchImpl = (async (url: string, init: RequestInit) => {
    sent = { url, body: JSON.parse(init.body as string) };
    return new Response(
      JSON.stringify({
        data: { code: 100, message: 'Success', authority: AUTH, fee: 1 },
        errors: [],
      }),
    );
  }) as unknown as typeof fetch;
  const r = await requestPayment(
    cfg,
    { amountRial: 490000, description: 'd', callbackUrl: 'https://x.ir/cb' },
    fetchImpl,
  );
  assert.equal(r.authority, AUTH);
  assert.equal(
    sent!.url,
    'https://payment.zarinpal.com/pg/v4/payment/request.json',
  );
  assert.equal(sent!.body.merchant_id, cfg.merchantId);
  assert.equal(sent!.body.amount, 490000);
  assert.equal(sent!.body.currency, 'IRR');
  assert.equal(
    startPayUrl(cfg, AUTH),
    `https://payment.zarinpal.com/pg/StartPay/${AUTH}`,
  );
  assert.equal(
    startPayUrl({ ...cfg, sandbox: true }, AUTH),
    `https://sandbox.zarinpal.com/pg/StartPay/${AUTH}`,
  );
});

test('requestPayment surfaces gateway errors', async () => {
  await assert.rejects(
    requestPayment(
      cfg,
      { amountRial: 1, description: 'd', callbackUrl: 'u' },
      reply({ data: [], errors: { code: -9, message: 'Validation error' } }),
    ),
    (e: { code: number }) => e.code === -9,
  );
});

test('verifyPayment treats 100 and 101 as paid, everything else as not', async () => {
  const ok = (code: number) =>
    reply({
      data: {
        code,
        message: 'Verified',
        ref_id: 201,
        card_pan: '502229******5995',
      },
      errors: [],
    });
  const a = await verifyPayment(
    cfg,
    { amountRial: 1, authority: AUTH },
    ok(100),
  );
  assert.deepEqual([a.paid, a.refId], [true, 201]);
  assert.equal(
    (await verifyPayment(cfg, { amountRial: 1, authority: AUTH }, ok(101)))
      .paid,
    true,
  );
  const bad = await verifyPayment(
    cfg,
    { amountRial: 1, authority: AUTH },
    reply({ data: [], errors: { code: -51, message: 'x' } }),
  );
  assert.deepEqual([bad.paid, bad.code], [false, -51]);
});

test('toman formatting', () => {
  assert.equal(formatToman(49000), '۴۹٬۰۰۰');
  assert.equal(formatToman(1500000), '۱٬۵۰۰٬۰۰۰');
  assert.equal(formatToman(900), '۹۰۰');
});
