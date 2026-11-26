import { readPaymentConfig } from '@/features/payments/lib/config';
import { orderCookie, readOrderCookie } from '@/features/payments/lib/cookie';
import { isProduct, normalizeFeatures, quote } from '@/features/payments/lib/pricing';
import {
  ORDER_ID_PATTERN,
  PENDING_TTL_SECONDS,
  allow,
  createOrder,
  discardPending,
  readOrder,
} from '@/features/payments/lib/store';
import { verifyPremiumToken } from '@/features/payments/lib/token';

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/**
 * Starts (or resumes) the card-to-card order of this browser for one product and returns
 * what to pay: the exact amount and the card.
 *
 *   body: { product, features?, token? }
 *
 * The price depends on the product and, for the sky poster, on its premium options. If the
 * browser already holds a payment for the same product (`token`) that covers fewer options,
 * only the difference is asked. If it already has an open order for exactly this, that same
 * order comes back, so reopening the payment window never reserves a second amount.
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    product?: unknown;
    features?: unknown;
    token?: unknown;
  } | null;
  const product = body?.product;
  if (!isProduct(product)) return Response.json({ error: 'invalid_product' }, { status: 400 });

  // an earlier payment for this same product, if the browser shows a genuine one
  const rawToken = body?.token;
  const earlier = typeof rawToken === 'string' ? verifyPremiumToken(rawToken, config.secret) : null;
  const paid = earlier && earlier.product === product ? earlier.features : null;
  const { amountToman: price, covered } = quote(
    product,
    normalizeFeatures(product, body?.features),
    paid,
    config.priceToman,
  );
  if (price <= 0) return Response.json({ error: 'already_covered' }, { status: 409 });

  const card = {
    number: config.card.number,
    holder: config.card.holder,
    bank: config.card.bank,
  };

  try {
    const existingId = readOrderCookie(request.headers.get('cookie'), product);
    if (existingId && ORDER_ID_PATTERN.test(existingId)) {
      const order = await readOrder(config.store, existingId);
      if (order && order.product === product) {
        // Waiting for the owner: the buyer already paid for it. If they want more, they pay
        // the difference once this one is approved.
        if (order.status === 'submitted') {
          return Response.json({
            status: order.status,
            code: existingId,
            amountToman: order.amountToman,
            product,
            features: order.features,
            card,
          });
        }
        const sameAsk =
          order.status === 'pending' &&
          order.amountToman > price &&
          order.amountToman <= price + 99 &&
          order.features.join() === covered.join();
        if (sameAsk) {
          return Response.json({
            status: order.status,
            code: existingId,
            amountToman: order.amountToman,
            product,
            features: order.features,
            card,
          });
        }
        // the buyer changed what they are buying: the old unpaid order is dropped
        if (order.status === 'pending') await discardPending(config.store, existingId);
      }
    }

    // A visitor can only open a handful of orders an hour; each one reserves an amount.
    if (!(await allow(config.store, `start:${clientIp(request)}`, 8, PENDING_TTL_SECONDS))) {
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }
    const created = await createOrder(config.store, { product, features: covered, priceToman: price });
    if (!created) return Response.json({ error: 'busy' }, { status: 503 });

    const secure = new URL(request.url).protocol === 'https:';
    return Response.json(
      {
        status: 'pending',
        code: created.id,
        amountToman: created.amountToman,
        product,
        features: covered,
        card,
      },
      { headers: { 'Set-Cookie': orderCookie(product, created.id, secure) } },
    );
  } catch (err) {
    console.error('payment start failed', err);
    return Response.json({ error: 'unavailable' }, { status: 502 });
  }
}
