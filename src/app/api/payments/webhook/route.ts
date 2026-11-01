import { readPaymentConfig } from '@/features/payments/lib/config';
import { markPaid } from '@/features/payments/lib/store';
import { parsePaidEvent, verifyWebhookSignature } from '@/features/payments/lib/variza';

/**
 * Variza's signed `payment.paid` webhook. Its address is registered once as the
 * callback URL in the Variza profile: <origin>/api/payments/webhook.
 *
 * Variza re-sends up to 5 times unless it gets a 200, so everything here is
 * idempotent, and only a failure worth retrying (storage down) answers non-200.
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) return new Response('not configured', { status: 503 });

  // The signature covers the raw body, so read it as text before parsing.
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature');
  if (!verifyWebhookSignature(rawBody, signature, config.webhookSecret)) {
    return new Response('invalid signature', { status: 400 });
  }

  const event = parsePaidEvent(rawBody);
  if (!event) return new Response('ignored', { status: 200 });

  try {
    const result = await markPaid(config.store, event.slug, {
      baseAmountToman: event.baseAmountToman,
      attemptCode: event.attemptCode,
    });
    if (result === 'unknown') {
      console.warn('variza webhook for an unknown payment', event.slug);
    } else if (result === 'mismatch') {
      console.error('variza webhook amount mismatch', event.slug, event.baseAmountToman);
    }
  } catch (err) {
    console.error('variza webhook storage failed', err);
    return new Response('storage error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
}
