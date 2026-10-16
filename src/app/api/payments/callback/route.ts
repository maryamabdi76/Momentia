import { clearPendingCookie, readPendingCookie } from '@/features/payments/lib/cookie';
import { readPaymentConfig, returnPath } from '@/features/payments/lib/config';
import { signPremiumToken } from '@/features/payments/lib/token';
import { AUTHORITY_PATTERN, verifyPayment } from '@/features/payments/lib/zarinpal';

/**
 * Where Zarinpal sends the buyer back: /api/payments/callback?Authority=…&Status=OK|NOK.
 * A successful, verified payment is turned into a signed token that the browser
 * receives in the URL fragment (so it never reaches server logs).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = readPaymentConfig();
  const origin = config?.siteUrl ?? url.origin;
  const secure = origin.startsWith('https:');

  const back = (result: 'ok' | 'cancelled' | 'failed', token?: string) => {
    const target = new URL(`${returnPath(url.searchParams.get('product'))}?step=3`, origin);
    target.searchParams.set('pay', result);
    if (token) target.hash = `pt=${token}`;
    return new Response(null, {
      status: 303,
      headers: {
        Location: target.toString(),
        'Set-Cookie': clearPendingCookie(secure),
      },
    });
  };

  const authority = url.searchParams.get('Authority') ?? '';
  const status = url.searchParams.get('Status');

  if (status !== 'OK') return back('cancelled');
  if (!config || !AUTHORITY_PATTERN.test(authority)) return back('failed');
  // Only the browser that started this payment may redeem it.
  if (readPendingCookie(request.headers.get('cookie')) !== authority) {
    return back('failed');
  }

  try {
    const result = await verifyPayment(config, {
      amountRial: config.amountRial,
      authority,
    });
    if (!result.paid) return back('failed');
    return back('ok', signPremiumToken(authority, config.secret));
  } catch (err) {
    console.error('zarinpal verify failed', err);
    return back('failed');
  }
}
