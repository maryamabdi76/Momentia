import { readPaymentConfig } from '@/features/payments/lib/config';
import { verifyPremiumToken } from '@/features/payments/lib/token';

/** Tells the browser whether its premium token is genuine and not expired. */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token : '';
  const ok = !!config && !!verifyPremiumToken(token, config.secret);
  return Response.json({ ok });
}
