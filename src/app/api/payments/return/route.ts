import { readPaymentConfig, returnPath } from '@/features/payments/lib/config';

/**
 * Where Variza sends the buyer back: /api/payments/return[?product=…].
 *
 * Nothing here proves a payment: Variza adds no result to the redirect, and the
 * signed webhook may still be on its way. So this only sends the buyer to the
 * create page, which then asks /api/payments/claim until the payment shows up.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = readPaymentConfig()?.siteUrl ?? url.origin;

  const target = new URL(
    `${returnPath(url.searchParams.get('product'))}?step=3`,
    origin,
  );
  target.searchParams.set('pay', 'pending');
  return new Response(null, {
    status: 303,
    headers: { Location: target.toString() },
  });
}
