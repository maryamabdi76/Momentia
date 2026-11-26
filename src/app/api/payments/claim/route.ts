import { readPaymentConfig } from '@/features/payments/lib/config';
import { readOrderCookie } from '@/features/payments/lib/cookie';
import { isProduct } from '@/features/payments/lib/pricing';
import { ORDER_ID_PATTERN, readOrder } from '@/features/payments/lib/store';
import { signPremiumToken } from '@/features/payments/lib/token';

/**
 * Where this browser's order for one product stands (`body: { product }`) and, once the
 * owner has approved it, the signed premium token. Only the browser that started the order
 * (it holds the cookie) can ask.
 *
 *   { status: 'paid', token }    approved
 *   { status: 'submitted' }      the buyer said they paid; the owner has not decided yet
 *   { status: 'pending' }        started, not submitted
 *   { status: 'rejected' }       the owner could not find the deposit
 *   { status: 'none' }           this browser has no open order (never started, or it expired)
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { product?: unknown } | null;
  const product = body?.product;
  if (!isProduct(product)) return Response.json({ status: 'none' });

  const orderId = readOrderCookie(request.headers.get('cookie'), product);
  if (!orderId || !ORDER_ID_PATTERN.test(orderId)) {
    return Response.json({ status: 'none' });
  }

  try {
    const order = await readOrder(config.store, orderId);
    if (!order || order.product !== product) return Response.json({ status: 'none' });
    if (order.status === 'paid') {
      return Response.json({
        status: 'paid',
        token: signPremiumToken(orderId, config.secret, {
          product: order.product,
          features: order.features,
        }),
      });
    }
    return Response.json({ status: order.status });
  } catch (err) {
    console.error('payment claim failed', err);
    return Response.json({ status: 'unavailable' }, { status: 502 });
  }
}
