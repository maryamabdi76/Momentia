import { readPaymentConfig } from '@/features/payments/lib/config';
import { orderCookie } from '@/features/payments/lib/cookie';
import { recoverOrder } from '@/features/payments/lib/recover';
import { allow } from '@/features/payments/lib/store';
import { signPremiumToken } from '@/features/payments/lib/token';

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/**
 * "I lost the tab": the buyer types the tracking code. If it belongs to an open order, this
 * browser gets that order's cookie again and, when it was approved, the signed token.
 *
 *   { status: 'paid', token } | { status: 'submitted' | 'pending' | 'rejected' } | { status: 'none' }
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) return Response.json({ status: 'unavailable' }, { status: 503 });

  try {
    // Guessing is hopeless, but keep it cheap to refuse anyway.
    if (!(await allow(config.store, `recover:${clientIp(request)}`, 10, 60 * 60))) {
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }
    const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
    const found = await recoverOrder(config.store, body?.code);
    if (!found) return Response.json({ status: 'none' });

    const secure = new URL(request.url).protocol === 'https:';
    const headers = { 'Set-Cookie': orderCookie(found.orderId, secure) };
    if (found.status === 'paid') {
      return Response.json(
        { status: 'paid', token: signPremiumToken(found.orderId, config.secret) },
        { headers },
      );
    }
    return Response.json({ status: found.status }, { headers });
  } catch (err) {
    console.error('payment recover failed', err);
    return Response.json({ status: 'unavailable' }, { status: 502 });
  }
}
