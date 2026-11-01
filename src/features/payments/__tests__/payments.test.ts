import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readPaymentConfig } from '../lib/config.ts';
import { signPremiumToken, verifyPremiumToken } from '../lib/token.ts';
import { pendingCookie, readPendingCookie } from '../lib/cookie.ts';
import {
  SLUG_PATTERN,
  createPaymentLink,
  parsePaidEvent,
  verifyWebhookSignature,
} from '../lib/variza.ts';
import {
  markPaid,
  readRecord,
  readStoreConfig,
  savePending,
} from '../lib/store.ts';
import { formatToman } from '../../poster/lib/digits.ts';

const SECRET = 'x'.repeat(40);
const SLUG = 'aB3xY9Qw2Z';
const store = { url: 'https://redis.example.upstash.io', token: 'tkn' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

/** A tiny in-memory stand-in for Upstash's REST API (GET and SET with EX/XX). */
function fakeRedis() {
  const data = new Map<string, string>();
  const calls: (string | number)[][] = [];
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    const args = JSON.parse(init.body as string) as (string | number)[];
    calls.push(args);
    const [cmd, key, value, ...rest] = args as [string, string, string, ...(string | number)[]];
    if (cmd === 'GET') return json({ result: data.get(key) ?? null });
    if (cmd === 'SET') {
      if (rest.includes('XX') && !data.has(key)) return json({ result: null });
      data.set(key, value);
      return json({ result: 'OK' });
    }
    return json({ error: 'unknown command' }, 400);
  }) as unknown as typeof fetch;
  return { fetchImpl, data, calls };
}

test('config needs Variza keys, a store, a long secret and a sane price', () => {
  const ok = {
    VARIZA_API_KEY: 'k',
    VARIZA_WEBHOOK_SECRET: 'w',
    UPSTASH_REDIS_REST_URL: store.url,
    UPSTASH_REDIS_REST_TOKEN: store.token,
    PAYMENT_TOKEN_SECRET: SECRET,
    NEXT_PUBLIC_PREMIUM_PRICE_IRT: '49000',
  };
  const config = readPaymentConfig(ok);
  assert.equal(config?.priceToman, 49000);
  assert.deepEqual(config?.store, store);
  assert.equal(readPaymentConfig({ ...ok, VARIZA_API_KEY: '' }), null);
  assert.equal(readPaymentConfig({ ...ok, VARIZA_WEBHOOK_SECRET: '' }), null);
  assert.equal(readPaymentConfig({ ...ok, UPSTASH_REDIS_REST_TOKEN: '' }), null);
  assert.equal(readPaymentConfig({ ...ok, PAYMENT_TOKEN_SECRET: 'short' }), null);
  assert.equal(readPaymentConfig({ ...ok, NEXT_PUBLIC_PREMIUM_PRICE_IRT: '10' }), null);
  assert.equal(readPaymentConfig({ ...ok, NEXT_PUBLIC_PREMIUM_PRICE_IRT: 'abc' }), null);
  assert.equal(
    readPaymentConfig({ ...ok, SITE_URL: 'https://example.ir/' })?.siteUrl,
    'https://example.ir',
  );
});

test('store config accepts the Upstash and Vercel KV variable names, https only', () => {
  assert.deepEqual(
    readStoreConfig({ KV_REST_API_URL: `${store.url}/`, KV_REST_API_TOKEN: 't' }),
    { url: store.url, token: 't' },
  );
  assert.equal(
    readStoreConfig({ UPSTASH_REDIS_REST_URL: 'http://insecure', UPSTASH_REDIS_REST_TOKEN: 't' }),
    null,
  );
  assert.equal(readStoreConfig({}), null);
});

test('premium token round-trips and rejects tampering and expiry', () => {
  const now = 1_000_000;
  const t = signPremiumToken(SLUG, SECRET, now, 5000);
  assert.deepEqual(verifyPremiumToken(t, SECRET, now + 1000), { reference: SLUG });
  assert.equal(verifyPremiumToken(t, SECRET, now + 6000), null, 'expired');
  assert.equal(verifyPremiumToken(t, 'y'.repeat(40), now), null, 'wrong secret');
  const [payload, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ a: SLUG, e: now + 9e9 })).toString('base64url');
  assert.equal(verifyPremiumToken(`${forged}.${sig}`, SECRET, now), null, 'payload swapped');
  assert.equal(verifyPremiumToken(`${payload}.`, SECRET, now), null);
  assert.equal(verifyPremiumToken('garbage', SECRET, now), null);
});

test('pending cookie is HttpOnly, scoped to the payments API and read back by name', () => {
  const cookie = pendingCookie(SLUG, true);
  assert.match(cookie, /^vz_pending=aB3xY9Qw2Z;/);
  assert.match(cookie, /Path=\/api\/payments/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.doesNotMatch(pendingCookie(SLUG, false), /Secure/);
  assert.equal(readPendingCookie(`a=1; vz_pending=${SLUG}; b=2`), SLUG);
  assert.equal(readPendingCookie('a=1'), null);
  assert.equal(readPendingCookie(null), null);
});

test('slug pattern keeps cookies and storage keys well-formed', () => {
  assert.ok(SLUG_PATTERN.test(SLUG));
  assert.ok(SLUG_PATTERN.test('a-b_C9xy'));
  assert.ok(!SLUG_PATTERN.test('../../etc'));
  assert.ok(!SLUG_PATTERN.test('abc'));
  assert.ok(!SLUG_PATTERN.test('a b c d e'));
  assert.ok(!SLUG_PATTERN.test('x'.repeat(65)));
});

test('createPaymentLink sends tomans with the bearer key and returns slug and URL', async () => {
  let sent: { url: string; init: RequestInit; body: Record<string, unknown> } | null = null;
  const fetchImpl = (async (url: string, init: RequestInit) => {
    sent = { url, init, body: JSON.parse(init.body as string) };
    return json({ slug: SLUG, pay_url: `https://variza.ir/pay/${SLUG}`, amount: 49000 }, 201);
  }) as unknown as typeof fetch;

  const link = await createPaymentLink(
    { apiKey: 'secret-key' },
    { amountToman: 49000, returnUrl: 'https://x.ir/api/payments/return', title: 'T' },
    fetchImpl,
  );
  assert.deepEqual(link, { slug: SLUG, payUrl: `https://variza.ir/pay/${SLUG}` });
  assert.equal(sent!.url, 'https://variza.ir/api/v1/pay');
  assert.equal(
    (sent!.init.headers as Record<string, string>).Authorization,
    'Bearer secret-key',
  );
  assert.equal(sent!.body.amount, 49000);
  assert.equal(sent!.body.return_url, 'https://x.ir/api/payments/return');
  assert.equal(sent!.body.title, 'T');
  assert.equal(sent!.body.expires_in, '1h');
});

test('createPaymentLink surfaces API errors and refuses unexpected responses', async () => {
  const input = { amountToman: 49000, returnUrl: 'https://x.ir/r' };
  const cfg = { apiKey: 'k' };
  const reply = (body: unknown, status: number) =>
    (async () => json(body, status)) as unknown as typeof fetch;

  await assert.rejects(
    createPaymentLink(cfg, input, reply({ message: 'callback_url missing' }, 422)),
    (e: { status: number; message: string }) =>
      e.status === 422 && e.message === 'callback_url missing',
  );
  await assert.rejects(
    createPaymentLink(cfg, input, reply({}, 401)),
    (e: { status: number }) => e.status === 401,
  );
  // the buyer is redirected to pay_url, so only Variza's own https pay page is accepted
  for (const pay_url of [
    'https://evil.example/pay/x',
    'http://variza.ir/pay/x',
    'https://variza.ir.evil.example/pay/x',
    'not a url',
  ]) {
    await assert.rejects(
      createPaymentLink(cfg, input, reply({ slug: SLUG, pay_url }, 201)),
      /pay_url/,
      pay_url,
    );
  }
  await assert.rejects(
    createPaymentLink(cfg, input, reply({ slug: '../x', pay_url: 'https://variza.ir/pay/x' }, 201)),
    /unexpected/,
  );
});

test('webhook signature is an HMAC-SHA256 of the raw body, compared safely', () => {
  const body = JSON.stringify({ event: 'payment.paid', slug: SLUG });
  const sign = (b: string, secret: string) =>
    'sha256=' + createHmac('sha256', secret).update(b).digest('hex');

  assert.equal(verifyWebhookSignature(body, sign(body, 'whsec'), 'whsec'), true);
  assert.equal(verifyWebhookSignature(body, ` ${sign(body, 'whsec')} `, 'whsec'), true);
  assert.equal(verifyWebhookSignature(body + ' ', sign(body, 'whsec'), 'whsec'), false, 'body changed');
  assert.equal(verifyWebhookSignature(body, sign(body, 'other'), 'whsec'), false, 'wrong secret');
  assert.equal(verifyWebhookSignature(body, null, 'whsec'), false, 'missing header');
  assert.equal(verifyWebhookSignature(body, 'sha256=abc', 'whsec'), false, 'wrong length');
  assert.equal(
    verifyWebhookSignature(body, sign(body, 'whsec').slice('sha256='.length), 'whsec'),
    false,
    'prefix required',
  );
});

test('parsePaidEvent accepts only a well-formed paid event', () => {
  const event = {
    event: 'payment.paid',
    slug: SLUG,
    attempt_code: '152688947983',
    amount: 49128,
    base_amount: 49000,
    status: 'paid',
    sent_at: '2026-08-05T11:45:00+00:00',
    member_phone: null,
  };
  assert.deepEqual(parsePaidEvent(JSON.stringify(event)), {
    slug: SLUG,
    attemptCode: '152688947983',
    baseAmountToman: 49000,
  });
  for (const bad of [
    { ...event, event: 'payment.failed' },
    { ...event, status: 'pending' },
    { ...event, slug: '../x' },
    { ...event, attempt_code: '' },
    { ...event, base_amount: '49000' },
    { ...event, base_amount: 49000.5 },
  ]) {
    assert.equal(parsePaidEvent(JSON.stringify(bad)), null, JSON.stringify(bad));
  }
  assert.equal(parsePaidEvent('not json'), null);
  assert.equal(parsePaidEvent('null'), null);
});

test('a pending payment is recorded with an expiry and sent with the bearer token', async () => {
  const redis = fakeRedis();
  let auth = '';
  const fetchImpl = (async (url: string, init: RequestInit) => {
    auth = (init.headers as Record<string, string>).Authorization;
    return redis.fetchImpl(url, init);
  }) as typeof fetch;

  await savePending(store, SLUG, 49000, fetchImpl);
  assert.equal(auth, 'Bearer tkn');
  assert.deepEqual(redis.calls[0].slice(0, 2), ['SET', `momentia:pay:${SLUG}`]);
  assert.ok(redis.calls[0].includes('EX'));
  assert.deepEqual(await readRecord(store, SLUG, redis.fetchImpl), {
    status: 'pending',
    amountToman: 49000,
  });
  assert.equal(await readRecord(store, 'nope-nope', redis.fetchImpl), null);
});

test('markPaid unlocks only payments we started, for the amount we asked', async () => {
  const redis = fakeRedis();
  const paid = { baseAmountToman: 49000, attemptCode: '152688947983' };

  assert.equal(await markPaid(store, SLUG, paid, redis.fetchImpl), 'unknown', 'never started');

  await savePending(store, SLUG, 49000, redis.fetchImpl);
  assert.equal(
    await markPaid(store, SLUG, { ...paid, baseAmountToman: 1000 }, redis.fetchImpl),
    'mismatch',
  );
  assert.equal((await readRecord(store, SLUG, redis.fetchImpl))?.status, 'pending');

  assert.equal(await markPaid(store, SLUG, paid, redis.fetchImpl), 'paid');
  assert.deepEqual(await readRecord(store, SLUG, redis.fetchImpl), {
    status: 'paid',
    amountToman: 49000,
    attemptCode: '152688947983',
  });

  // Variza re-sends the webhook until it gets a 200: a repeat changes nothing
  const writes = redis.calls.filter((c) => c[0] === 'SET').length;
  assert.equal(await markPaid(store, SLUG, paid, redis.fetchImpl), 'paid');
  assert.equal(redis.calls.filter((c) => c[0] === 'SET').length, writes);
});

test('markPaid never resurrects an expired record', async () => {
  const redis = fakeRedis();
  await savePending(store, SLUG, 49000, redis.fetchImpl);
  // the record expires between the read and the write
  const racing = (async (url: string, init: RequestInit) => {
    const args = JSON.parse(init.body as string) as string[];
    if (args[0] === 'SET' && args.includes('XX')) redis.data.clear();
    return redis.fetchImpl(url, init);
  }) as typeof fetch;
  await markPaid(store, SLUG, { baseAmountToman: 49000, attemptCode: 'a' }, racing);
  assert.equal(await readRecord(store, SLUG, redis.fetchImpl), null);
});

test('store errors are thrown so the webhook can answer non-200 and be retried', async () => {
  const down = (async () => json({ error: 'ERR boom' }, 500)) as unknown as typeof fetch;
  await assert.rejects(readRecord(store, SLUG, down), /ERR boom/);
  const offline = (async () => {
    throw new Error('network');
  }) as unknown as typeof fetch;
  await assert.rejects(savePending(store, SLUG, 1000, offline), /network/);
});

test('toman formatting', () => {
  assert.equal(formatToman(49000), '۴۹٬۰۰۰');
  assert.equal(formatToman(1500000), '۱٬۵۰۰٬۰۰۰');
  assert.equal(formatToman(900), '۹۰۰');
});
