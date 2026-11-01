import { pendingCookie } from '@/features/payments/lib/cookie';
import { readPaymentConfig, RETURN_PATHS } from '@/features/payments/lib/config';
import { savePending } from '@/features/payments/lib/store';
import { createPaymentLink } from '@/features/payments/lib/variza';

/** Creates a Variza payment link for the premium poster and returns its URL. */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  // /api/payments/start?product=moon sends the buyer back to /moon afterwards
  const asked = new URL(request.url).searchParams.get('product');
  const product =
    asked && Object.hasOwn(RETURN_PATHS, asked) ? `?product=${asked}` : '';

  const origin = config.siteUrl ?? new URL(request.url).origin;
  try {
    const { slug, payUrl } = await createPaymentLink(config, {
      amountToman: config.priceToman,
      title: 'دانلود بدون نشان Momentia',
      returnUrl: `${origin}/api/payments/return${product}`,
      expiresIn: '1h',
    });
    // Recorded before the buyer leaves, so the webhook always finds it.
    await savePending(config.store, slug, config.priceToman);
    return Response.json(
      { url: payUrl },
      {
        headers: {
          'Set-Cookie': pendingCookie(slug, origin.startsWith('https:')),
        },
      },
    );
  } catch (err) {
    console.error('variza request failed', err);
    return Response.json({ error: 'gateway' }, { status: 502 });
  }
}
