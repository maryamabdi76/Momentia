import { readPaymentConfig } from '@/features/payments/lib/config';
import { readOrderCookie } from '@/features/payments/lib/cookie';
import {
  ORDER_ID_PATTERN,
  acquireLock,
  allow,
  markSubmitted,
  readOrder,
  releaseLock,
} from '@/features/payments/lib/store';
import { describeTelegramFailure, sendApprovalRequest } from '@/features/payments/lib/telegram';

/**
 * "I paid". Tells the owner on Telegram (with ✅ / ❌ buttons) and marks the order submitted.
 * The buyer may add the last 4 digits of the card they paid from, to help find the deposit.
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const orderId = readOrderCookie(request.headers.get('cookie'));
  if (!orderId || !ORDER_ID_PATTERN.test(orderId)) {
    return Response.json({ error: 'no_order' }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { last4?: unknown } | null;
  const last4 = typeof body?.last4 === 'string' ? body.last4.trim() : '';
  if (last4 && !/^\d{4}$/.test(last4)) {
    return Response.json({ error: 'invalid_last4' }, { status: 400 });
  }

  try {
    const order = await readOrder(config.store, orderId);
    if (!order) return Response.json({ error: 'no_order' }, { status: 404 });
    // Already told the owner (or already decided): just report where it stands.
    if (order.status !== 'pending') return Response.json({ status: order.status });

    // One message per order even if the button is pressed twice, and a cap per order.
    // The order is still pending here, so a held lock means another request is sending right
    // now; it must not be reported as submitted (nothing may have reached the owner yet).
    const lock = `submit:${orderId}`;
    if (!(await acquireLock(config.store, lock, 30))) {
      return Response.json({ error: 'busy' }, { status: 409 });
    }
    if (!(await allow(config.store, lock, 5, 60 * 60))) {
      await releaseLock(config.store, lock).catch(() => {});
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }

    // The owner is told first: an order the owner never heard about must not look submitted.
    try {
      await sendApprovalRequest(config.telegram, {
        orderId,
        amountToman: order.amountToman,
        payerLast4: last4 || null,
      });
    } catch (err) {
      // Without this the lock would stay for 30 seconds and a retry would be turned away.
      await releaseLock(config.store, lock).catch(() => {});
      console.error(`telegram notify failed: ${describeTelegramFailure(err)}`);
      return Response.json({ error: 'notify_failed' }, { status: 502 });
    }
    await markSubmitted(config.store, orderId);
    return Response.json({ status: 'submitted' });
  } catch (err) {
    console.error('payment submit failed', err);
    return Response.json({ error: 'unavailable' }, { status: 502 });
  }
}
