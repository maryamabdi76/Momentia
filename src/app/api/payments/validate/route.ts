import { readPaymentConfig } from '@/features/payments/lib/config';
import { covers, isProduct, normalizeFeatures } from '@/features/payments/lib/pricing';
import { verifyPremiumToken } from '@/features/payments/lib/token';

/**
 * Tells the browser whether its premium token is genuine, not expired, and pays for what it
 * wants: the same product, and every premium option the poster uses.
 *
 *   body: { token, product, features? }
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    product?: unknown;
    features?: unknown;
  } | null;
  const token = typeof body?.token === 'string' ? body.token : '';
  const verified = config ? verifyPremiumToken(token, config.secret) : null;
  const product = body?.product;
  const ok =
    !!verified &&
    isProduct(product) &&
    verified.product === product &&
    covers(verified.features, normalizeFeatures(product, body?.features));
  return Response.json({ ok });
}
