import { createHmac, timingSafeEqual } from 'node:crypto';

import { isProduct, normalizeFeatures, type Feature, type Product } from './pricing.ts';

/**
 * A stateless proof of payment: `base64url(json).hmac`. It carries the payment's
 * reference (the order id), what was paid for (the product and its premium options) and
 * an expiry, and is signed with a server secret, so checking it needs no storage lookup.
 */
export const PREMIUM_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const mac = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url');

export type TokenScope = { product: Product; features: readonly Feature[] };

export function signPremiumToken(
  reference: string,
  secret: string,
  scope: TokenScope,
  now: number = Date.now(),
  ttlMs: number = PREMIUM_TOKEN_TTL_MS,
): string {
  const payload = Buffer.from(
    JSON.stringify({
      a: reference,
      e: now + ttlMs,
      p: scope.product,
      f: normalizeFeatures(scope.product, scope.features),
    }),
  ).toString('base64url');
  return `${payload}.${mac(payload, secret)}`;
}

export function verifyPremiumToken(
  token: string,
  secret: string,
  now: number = Date.now(),
): { reference: string; product: Product; features: Feature[] } | null {
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length) return null;

  const expected = Buffer.from(mac(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const { a, e, p, f } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof a !== 'string' || typeof e !== 'number' || e < now) return null;
    // a token from before payments were per product names no product, so it opens nothing
    if (!isProduct(p)) return null;
    return { reference: a, product: p, features: normalizeFeatures(p, f) };
  } catch {
    return null;
  }
}
