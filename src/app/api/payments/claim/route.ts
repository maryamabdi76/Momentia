import { readPaymentConfig } from '@/features/payments/lib/config';
import { readPendingCookie } from '@/features/payments/lib/cookie';
import { readRecord } from '@/features/payments/lib/store';
import { signPremiumToken } from '@/features/payments/lib/token';
import { SLUG_PATTERN } from '@/features/payments/lib/variza';

/**
 * Turns a confirmed payment into the signed premium token. Only the browser that
 * started the payment (it holds the `vz_pending` cookie) can claim it.
 *
 *   { status: 'paid', token }  the webhook has confirmed the payment
 *   { status: 'pending' }      payment started but not confirmed (yet)
 *   { status: 'none' }         this browser has no payment to claim
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }

  const slug = readPendingCookie(request.headers.get('cookie'));
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return Response.json({ status: 'none' });
  }

  try {
    const record = await readRecord(config.store, slug);
    if (!record) return Response.json({ status: 'none' });
    if (record.status !== 'paid') return Response.json({ status: 'pending' });
    return Response.json({
      status: 'paid',
      token: signPremiumToken(slug, config.secret),
    });
  } catch (err) {
    console.error('variza claim failed', err);
    return Response.json({ status: 'unavailable' }, { status: 502 });
  }
}
