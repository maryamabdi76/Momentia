import { readStoreConfig, type StoreConfig } from './store.ts';

/**
 * Payment settings, read from the environment on the server.
 *
 *   VARIZA_API_KEY                  API key (Variza panel → profile → API key)
 *   VARIZA_WEBHOOK_SECRET           webhook secret (same profile page)
 *   UPSTASH_REDIS_REST_URL/_TOKEN   where payment status is kept; the Vercel
 *                                   KV_REST_API_URL/_TOKEN names work too
 *   PAYMENT_TOKEN_SECRET            ≥ 32 random characters, signs the download token
 *   NEXT_PUBLIC_PREMIUM_PRICE_IRT   price in tomans (shown in the UI and charged)
 *   SITE_URL                        optional, e.g. https://example.ir — the buyer's
 *                                   return origin; must be https for Variza
 *
 * The webhook address (`<origin>/api/payments/webhook`) is registered once as the
 * callback URL in the Variza profile; it is not an environment variable.
 */
export type PaymentConfig = {
  apiKey: string;
  webhookSecret: string;
  store: StoreConfig;
  secret: string;
  /** Price in tomans, the unit Variza charges in. */
  priceToman: number;
  siteUrl: string | null;
};

// Variza: at least 1,000 tomans per link.
const MIN_TOMAN = 1_000;
const MAX_TOMAN = 100_000_000;

type Env = Record<string, string | undefined>;

export function readPaymentConfig(
  env: Env = process.env,
): PaymentConfig | null {
  const apiKey = env.VARIZA_API_KEY?.trim();
  const webhookSecret = env.VARIZA_WEBHOOK_SECRET?.trim();
  const secret = env.PAYMENT_TOKEN_SECRET?.trim();
  const store = readStoreConfig(env);
  const priceToman = Number(env.NEXT_PUBLIC_PREMIUM_PRICE_IRT);

  if (!apiKey || !webhookSecret || !store) return null;
  if (!secret || secret.length < 32) return null;
  if (
    !Number.isInteger(priceToman) ||
    priceToman < MIN_TOMAN ||
    priceToman > MAX_TOMAN
  ) {
    return null;
  }

  const siteUrl = env.SITE_URL?.trim().replace(/\/+$/, '') || null;
  return { apiKey, webhookSecret, store, secret, priceToman, siteUrl };
}

/** Products with their own create page; the buyer returns there after paying. */
export const RETURN_PATHS = { moon: '/moon' } as const;

export function returnPath(product: string | null): string {
  return product && Object.hasOwn(RETURN_PATHS, product)
    ? RETURN_PATHS[product as keyof typeof RETURN_PATHS]
    : '/create';
}
