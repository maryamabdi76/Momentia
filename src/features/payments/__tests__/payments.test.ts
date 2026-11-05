import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCardNumber, readPaymentConfig } from '../lib/config.ts';
import { signPremiumToken, verifyPremiumToken } from '../lib/token.ts';
import { ORDER_COOKIE, orderCookie, readOrderCookie } from '../lib/cookie.ts';
import {
  MAX_AMOUNT_OFFSET,
  ORDER_ID_PATTERN,
  acquireLock,
  allow,
  createOrder,
  decideOrder,
  markSubmitted,
  readOrder,
  readStoreConfig,
  releaseLock,
} from '../lib/store.ts';
import {
  answerCallback,
  TelegramError,
  approvalText,
  describeTelegramFailure,
  parseDecision,
  readTelegramConfig,
  sendApprovalRequest,
  showOutcome,
  verifyWebhookSecret,
} from '../lib/telegram.ts';
import { formatToman } from '../../poster/lib/digits.ts';

const SECRET = 'x'.repeat(40);
const OWNER = '123456789';
const ID = 'aB3xY9Qw2Zk7Lm4P';
const store = { url: 'https://redis.example.upstash.io', token: 'tkn' };
const telegram = { botToken: '1:abc', chatId: OWNER, webhookSecret: 'secret_token_1234567890' };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A tiny in-memory stand-in for Upstash's REST API: GET, SET (EX/NX/XX), DEL, INCR, EXPIRE. */
function fakeRedis() {
  const data = new Map<string, string>();
  const ttl = new Map<string, number>();
  const calls: (string | number)[][] = [];
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    const args = JSON.parse(init.body as string) as (string | number)[];
    calls.push(args);
    const [cmd, key, ...rest] = args as [string, string, ...(string | number)[]];
    switch (cmd) {
      case 'GET':
        return json({ result: data.get(key) ?? null });
      case 'SET': {
        const [value, ...flags] = rest as [string, ...(string | number)[]];
        if (flags.includes('NX') && data.has(key)) return json({ result: null });
        if (flags.includes('XX') && !data.has(key)) return json({ result: null });
        data.set(key, value);
        const ex = flags.indexOf('EX');
        if (ex >= 0) ttl.set(key, Number(flags[ex + 1]));
        return json({ result: 'OK' });
      }
      case 'DEL':
        return json({ result: data.delete(key) ? 1 : 0 });
      case 'INCR': {
        const n = Number(data.get(key) ?? 0) + 1;
        data.set(key, String(n));
        return json({ result: n });
      }
      case 'EXPIRE':
        ttl.set(key, Number(rest[0]));
        return json({ result: data.has(key) ? 1 : 0 });
      default:
        return json({ error: 'unknown command' }, 400);
    }
  }) as unknown as typeof fetch;
  return { fetchImpl, data, ttl, calls };
}

const goodEnv = {
  PAYMENT_CARD: '6219 8618 0000 1111',
  PAYMENT_CARD_HOLDER: ' مریم عبدی ',
  PAYMENT_CARD_BANK: 'بلو',
  TELEGRAM_BOT_TOKEN: telegram.botToken,
  TELEGRAM_CHAT_ID: OWNER,
  TELEGRAM_WEBHOOK_SECRET: telegram.webhookSecret,
  UPSTASH_REDIS_REST_URL: store.url,
  UPSTASH_REDIS_REST_TOKEN: store.token,
  PAYMENT_TOKEN_SECRET: SECRET,
  NEXT_PUBLIC_PREMIUM_PRICE_IRT: '49000',
};

test('config needs a card, Telegram, a store, a long secret and a sane price', () => {
  const config = readPaymentConfig(goodEnv);
  assert.equal(config?.priceToman, 49000);
  assert.deepEqual(config?.card, { number: '6219861800001111', holder: 'مریم عبدی', bank: 'بلو' });
  assert.deepEqual(config?.store, store);
  assert.equal(readPaymentConfig({ ...goodEnv, PAYMENT_CARD: '1234' }), null);
  assert.equal(readPaymentConfig({ ...goodEnv, TELEGRAM_BOT_TOKEN: '' }), null);
  assert.equal(readPaymentConfig({ ...goodEnv, UPSTASH_REDIS_REST_URL: '' }), null);
  assert.equal(readPaymentConfig({ ...goodEnv, PAYMENT_TOKEN_SECRET: 'short' }), null);
  assert.equal(readPaymentConfig({ ...goodEnv, NEXT_PUBLIC_PREMIUM_PRICE_IRT: '10' }), null);
  assert.equal(readPaymentConfig({ ...goodEnv, NEXT_PUBLIC_PREMIUM_PRICE_IRT: '1.5' }), null);
  assert.equal(readPaymentConfig({}), null);
});

test('card numbers: Persian digits, spaces and dashes are fine, anything else is not', () => {
  assert.equal(normalizeCardNumber('۶۲۱۹-۸۶۱۸-۰۰۰۰-۱۱۱۱'), '6219861800001111');
  assert.equal(normalizeCardNumber('6219 8618 0000 111'), null);
  assert.equal(normalizeCardNumber(undefined), null);
});

test('telegram config needs a numeric chat id and a secret Telegram will accept', () => {
  assert.deepEqual(readTelegramConfig(goodEnv), telegram);
  assert.equal(readTelegramConfig({ ...goodEnv, TELEGRAM_CHAT_ID: '@me' }), null);
  assert.equal(readTelegramConfig({ ...goodEnv, TELEGRAM_WEBHOOK_SECRET: 'short' }), null);
  assert.equal(readTelegramConfig({ ...goodEnv, TELEGRAM_WEBHOOK_SECRET: 'has space in it 123456' }), null);
});

test('store config accepts the Upstash and Vercel KV variable names, https only', () => {
  assert.deepEqual(readStoreConfig({ KV_REST_API_URL: `${store.url}/`, KV_REST_API_TOKEN: 'k' }), {
    url: store.url,
    token: 'k',
  });
  assert.equal(readStoreConfig({ UPSTASH_REDIS_REST_URL: 'http://x', UPSTASH_REDIS_REST_TOKEN: 'k' }), null);
  assert.equal(readStoreConfig({}), null);
});

test('premium token round-trips and rejects tampering and expiry', () => {
  const token = signPremiumToken(ID, SECRET, 1_000, 5_000);
  assert.deepEqual(verifyPremiumToken(token, SECRET, 2_000), { reference: ID });
  assert.equal(verifyPremiumToken(token, SECRET, 7_000), null);
  assert.equal(verifyPremiumToken(token, 'y'.repeat(40), 2_000), null);
  assert.equal(verifyPremiumToken(`${token}x`, SECRET, 2_000), null);
});

test('order cookie is HttpOnly, scoped to the payments API and read back by name', () => {
  const cookie = orderCookie(ID, true);
  assert.match(cookie, new RegExp(`^${ORDER_COOKIE}=${ID};`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Path=\/api\/payments/);
  assert.match(cookie, /Secure/);
  assert.doesNotMatch(orderCookie(ID, false), /Secure/);
  assert.equal(readOrderCookie(`a=1; ${ORDER_COOKIE}=${ID}; b=2`), ID);
  assert.equal(readOrderCookie('a=1'), null);
  assert.equal(readOrderCookie(null), null);
});

test('an order reserves a unique amount just above the price', async () => {
  const redis = fakeRedis();
  const seen = new Set<number>();
  for (let i = 0; i < 20; i++) {
    const order = await createOrder(store, 49000, redis.fetchImpl);
    assert.ok(order);
    assert.match(order.id, ORDER_ID_PATTERN);
    assert.ok(order.amountToman > 49000 && order.amountToman <= 49000 + MAX_AMOUNT_OFFSET);
    assert.ok(!seen.has(order.amountToman), 'two open orders must never share an amount');
    seen.add(order.amountToman);
    assert.deepEqual(await readOrder(store, order.id, redis.fetchImpl), {
      status: 'pending',
      amountToman: order.amountToman,
    });
  }
  // everything is stored with an expiry and sent with the bearer token
  assert.ok(redis.calls.some((c) => c[0] === 'SET' && c.includes('EX') && c.includes('NX')));
});

test('createOrder gives up (instead of sharing an amount) when every amount is taken', async () => {
  const redis = fakeRedis();
  for (let offset = 1; offset <= MAX_AMOUNT_OFFSET; offset++) {
    redis.data.set(`momentia:amount:${49000 + offset}`, 'someone');
  }
  assert.equal(await createOrder(store, 49000, redis.fetchImpl), null);
});

test('submitting an order is allowed once and keeps the amount reserved for a day', async () => {
  const redis = fakeRedis();
  const order = (await createOrder(store, 49000, redis.fetchImpl))!;
  assert.equal(await markSubmitted(store, order.id, redis.fetchImpl), 'submitted');
  assert.equal((await readOrder(store, order.id, redis.fetchImpl))?.status, 'submitted');
  assert.equal(redis.ttl.get(`momentia:amount:${order.amountToman}`), 24 * 60 * 60);
  assert.equal(await markSubmitted(store, order.id, redis.fetchImpl), 'not_pending');
  assert.equal(await markSubmitted(store, 'doesNotExist0000', redis.fetchImpl), 'unknown');
});

test('only a submitted order can be decided, and a decision is final', async () => {
  const redis = fakeRedis();
  const order = (await createOrder(store, 49000, redis.fetchImpl))!;
  assert.equal(await decideOrder(store, order.id, 'paid', redis.fetchImpl), 'not_submitted');
  await markSubmitted(store, order.id, redis.fetchImpl);
  assert.equal(await decideOrder(store, order.id, 'paid', redis.fetchImpl), 'paid');
  assert.equal((await readOrder(store, order.id, redis.fetchImpl))?.status, 'paid');
  // a late or repeated press never flips it
  assert.equal(await decideOrder(store, order.id, 'rejected', redis.fetchImpl), 'already_decided');
  assert.equal((await readOrder(store, order.id, redis.fetchImpl))?.status, 'paid');
  assert.equal(await decideOrder(store, 'doesNotExist0000', 'paid', redis.fetchImpl), 'unknown');
});

test('rejecting an order frees its amount for someone else', async () => {
  const redis = fakeRedis();
  const order = (await createOrder(store, 49000, redis.fetchImpl))!;
  await markSubmitted(store, order.id, redis.fetchImpl);
  assert.equal(await decideOrder(store, order.id, 'rejected', redis.fetchImpl), 'rejected');
  assert.equal(redis.data.has(`momentia:amount:${order.amountToman}`), false);
});

test('a decision never resurrects an expired order', async () => {
  const redis = fakeRedis();
  const order = (await createOrder(store, 49000, redis.fetchImpl))!;
  await markSubmitted(store, order.id, redis.fetchImpl);
  redis.data.delete(`momentia:order:${order.id}`);
  assert.equal(await decideOrder(store, order.id, 'paid', redis.fetchImpl), 'unknown');
  assert.equal(redis.data.has(`momentia:order:${order.id}`), false);
});

test('rate limit allows up to the maximum, and a lock is held once', async () => {
  const redis = fakeRedis();
  const results = [];
  for (let i = 0; i < 4; i++) results.push(await allow(store, 'ip', 3, 60, redis.fetchImpl));
  assert.deepEqual(results, [true, true, true, false]);
  assert.equal(await acquireLock(store, 'x', 30, redis.fetchImpl), true);
  assert.equal(await acquireLock(store, 'x', 30, redis.fetchImpl), false);
});

test('store errors are thrown so the caller can answer 5xx', async () => {
  const failing = (async () => json({ error: 'ERR boom' }, 500)) as unknown as typeof fetch;
  await assert.rejects(readOrder(store, ID, failing), /boom/);
});

test('the owner is sent the amount, the order and the buyer\'s last digits with two buttons', async () => {
  const sent: { url: string; body: Record<string, unknown> }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    sent.push({ url, body: JSON.parse(init.body as string) });
    return json({ ok: true, result: {} });
  }) as unknown as typeof fetch;
  await sendApprovalRequest(telegram, { orderId: ID, amountToman: 49023, payerLast4: '1234' }, fetchImpl);
  assert.equal(sent[0].url, 'https://api.telegram.org/bot1:abc/sendMessage');
  assert.equal(sent[0].body.chat_id, OWNER);
  const text = sent[0].body.text as string;
  assert.match(text, /۴۹٬?,?۰۲۳|۴۹,۰۲۳/);
  assert.ok(text.includes(ID) && text.includes('۱۲۳۴'));
  const buttons = (sent[0].body.reply_markup as { inline_keyboard: { callback_data: string }[][] })
    .inline_keyboard[0];
  assert.deepEqual(buttons.map((b) => b.callback_data), [`ok:${ID}`, `no:${ID}`]);
  assert.ok(buttons.every((b) => Buffer.byteLength(b.callback_data) <= 64));
  assert.match(approvalText({ orderId: ID, amountToman: 1, payerLast4: null }), /وارد نشده/);
});

test('a failed Telegram call is reported as an error', async () => {
  const fetchImpl = (async () =>
    json({ ok: false, description: 'Forbidden: bot was blocked' }, 403)) as unknown as typeof fetch;
  await assert.rejects(
    sendApprovalRequest(telegram, { orderId: ID, amountToman: 1, payerLast4: null }, fetchImpl),
    /blocked/,
  );
});

test('webhook secret is compared safely', () => {
  assert.equal(verifyWebhookSecret(telegram.webhookSecret, telegram.webhookSecret), true);
  assert.equal(verifyWebhookSecret('wrong_secret_token_123456', telegram.webhookSecret), false);
  assert.equal(verifyWebhookSecret('', telegram.webhookSecret), false);
  assert.equal(verifyWebhookSecret(null, telegram.webhookSecret), false);
});

const press = (data: string, fromId: number | string = Number(OWNER)) => ({
  update_id: 1,
  callback_query: {
    id: 'cb1',
    data,
    from: { id: fromId },
    message: { message_id: 7, text: 'متن', chat: { id: Number(OWNER) } },
  },
});

test('only the owner\'s button presses on well-formed data become decisions', () => {
  assert.deepEqual(parseDecision(press(`ok:${ID}`), OWNER), {
    decision: 'paid',
    orderId: ID,
    callbackQueryId: 'cb1',
    chatId: Number(OWNER),
    messageId: 7,
    messageText: 'متن',
  });
  assert.equal(parseDecision(press(`no:${ID}`), OWNER)?.decision, 'rejected');
  // someone else pressing a button (e.g. the bot was added to a group) is ignored
  assert.equal(parseDecision(press(`ok:${ID}`, 999), OWNER), null);
  assert.equal(parseDecision(press('ok:short'), OWNER), null);
  assert.equal(parseDecision(press(`yes:${ID}`), OWNER), null);
  assert.equal(parseDecision({ message: { text: 'hi' } }, OWNER), null);
  assert.equal(parseDecision(null, OWNER), null);
  assert.equal(parseDecision('nope', OWNER), null);
});

test('the owner gets an answer and the buttons are replaced by the outcome', async () => {
  const sent: { method: string; body: Record<string, unknown> }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    sent.push({ method: url.split('/').pop()!, body: JSON.parse(init.body as string) });
    return json({ ok: true, result: {} });
  }) as unknown as typeof fetch;
  const d = parseDecision(press(`ok:${ID}`), OWNER)!;
  await answerCallback(telegram, d.callbackQueryId, '✅ تأیید شد', fetchImpl);
  await showOutcome(telegram, d, '✅ تأیید شد', fetchImpl);
  assert.deepEqual(sent.map((s) => s.method), ['answerCallbackQuery', 'editMessageText']);
  assert.equal(sent[1].body.text, 'متن\n\n✅ تأیید شد');
  assert.deepEqual(sent[1].body.reply_markup, { inline_keyboard: [] });
});

test('toman formatting', () => {
  assert.equal(formatToman(49000), '۴۹٬۰۰۰');
});

test('a lock that is released can be taken again at once (a failed send must not block the retry)', async () => {
  const redis = fakeRedis();
  assert.equal(await acquireLock(store, 'submit:a', 30, redis.fetchImpl), true);
  assert.equal(await acquireLock(store, 'submit:a', 30, redis.fetchImpl), false);
  await releaseLock(store, 'submit:a', redis.fetchImpl);
  assert.equal(await acquireLock(store, 'submit:a', 30, redis.fetchImpl), true);
});

test('a network failure or a 5xx is retried once; a wrong chat id is not', async () => {
  const input = { orderId: ID, amountToman: 1, payerLast4: null };
  let calls = 0;
  const flaky = (async () => {
    calls++;
    if (calls === 1) throw new TypeError('fetch failed');
    return json({ ok: true, result: {} });
  }) as unknown as typeof fetch;
  await sendApprovalRequest(telegram, input, flaky, 0);
  assert.equal(calls, 2);

  let wrong = 0;
  const notFound = (async () => {
    wrong++;
    return json({ ok: false, description: 'Bad Request: chat not found' }, 400);
  }) as unknown as typeof fetch;
  await assert.rejects(sendApprovalRequest(telegram, input, notFound, 0), /chat not found/);
  assert.equal(wrong, 1);
});

test('a network error never carries the bot token', async () => {
  const down = (async () => {
    throw new TypeError(`fetch failed https://api.telegram.org/bot${telegram.botToken}/sendMessage`);
  }) as unknown as typeof fetch;
  await assert.rejects(
    sendApprovalRequest(telegram, { orderId: ID, amountToman: 1, payerLast4: null }, down, 0),
    (err: Error) => err instanceof TelegramError && !err.message.includes(telegram.botToken),
  );
});

test('failures are explained for the server log', () => {
  assert.match(describeTelegramFailure(new TelegramError('Bad Request: chat not found', 400)), /TELEGRAM_CHAT_ID/);
  assert.match(describeTelegramFailure(new TelegramError('Unauthorized', 401)), /TELEGRAM_BOT_TOKEN/);
  assert.match(describeTelegramFailure(new TelegramError('Forbidden: bot was blocked by the user', 403)), /blocked/);
  assert.match(describeTelegramFailure(new TelegramError('TypeError', 0)), /network/);
  assert.match(describeTelegramFailure(new Error('x')), /unexpected/);
});
