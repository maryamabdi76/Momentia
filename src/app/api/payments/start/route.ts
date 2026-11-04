import { readPaymentConfig } from '@/features/payments/lib/config';
import { orderCookie, readOrderCookie } from '@/features/payments/lib/cookie';
import {
  ORDER_ID_PATTERN,
  PENDING_TTL_SECONDS,
  allow,
  createOrder,
  readOrder,
} from '@/features/payments/lib/store';

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/**
 * Starts (or resumes) the card-to-card order of this browser and returns what to pay:
 * the exact amount and the card. If the browser already has an open order, that same
 * order comes back, so reopening the payment window never reserves a second amount.
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const card = {
    number: config.card.number,
    holder: config.card.holder,
    bank: config.card.bank,
  };

  try {
    const existingId = readOrderCookie(request.headers.get('cookie'));
    if (existingId && ORDER_ID_PATTERN.test(existingId)) {
      const order = await readOrder(config.store, existingId);
      if (order && (order.status === 'pending' || order.status === 'submitted')) {
        return Response.json({
          status: order.status,
          amountToman: order.amountToman,
          card,
        });
      }
    }

    // A visitor can only open a handful of orders an hour; each one reserves an amount.
    if (!(await allow(config.store, `start:${clientIp(request)}`, 8, PENDING_TTL_SECONDS))) {
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }
    const created = await createOrder(config.store, config.priceToman);
    if (!created) return Response.json({ error: 'busy' }, { status: 503 });

    const secure = new URL(request.url).protocol === 'https:';
    return Response.json(
      { status: 'pending', amountToman: created.amountToman, card },
      { headers: { 'Set-Cookie': orderCookie(created.id, secure) } },
    );
  } catch (err) {
    console.error('payment start failed', err);
    return Response.json({ error: 'unavailable' }, { status: 502 });
  }
}
