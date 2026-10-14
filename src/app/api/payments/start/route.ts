import { pendingCookie } from '@/features/payments/lib/cookie';
import { readPaymentConfig } from '@/features/payments/lib/config';
import { requestPayment, startPayUrl } from '@/features/payments/lib/zarinpal';

/** Creates a Zarinpal payment for the premium poster and returns the gateway URL. */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const origin = config.siteUrl ?? new URL(request.url).origin;
  try {
    const { authority } = await requestPayment(config, {
      amountRial: config.amountRial,
      description: 'Momentia premium night-sky poster',
      callbackUrl: `${origin}/api/payments/callback`,
    });
    return Response.json(
      { url: startPayUrl(config, authority) },
      {
        headers: {
          'Set-Cookie': pendingCookie(authority, origin.startsWith('https:')),
        },
      },
    );
  } catch (err) {
    console.error('zarinpal request failed', err);
    return Response.json({ error: 'gateway' }, { status: 502 });
  }
}
