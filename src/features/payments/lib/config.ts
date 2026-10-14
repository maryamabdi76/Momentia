/**
 * Payment settings, read from the environment on the server.
 *
 *   ZARINPAL_MERCHANT_ID            36-character merchant id (any UUID in sandbox)
 *   ZARINPAL_SANDBOX                "true" to use sandbox.zarinpal.com
 *   PAYMENT_TOKEN_SECRET            ≥ 32 random characters, signs the download token
 *   PREMIUM_PRICE_IRT   price in tomans (shown in the UI and charged)
 *   SITE_URL                        optional, e.g. https://example.ir — the callback
 *                                   origin; must match the domain registered with Zarinpal
 */
export type PaymentConfig = {
  merchantId: string;
  sandbox: boolean;
  secret: string;
  /** Price in tomans. */
  priceToman: number;
  /** Price in rials — the unit Zarinpal's request and verify calls use here. */
  amountRial: number;
  siteUrl: string | null;
};

// Zarinpal: at least 10,000 rials per payment, at most 100,000,000 tomans.
const MIN_TOMAN = 1_000;
const MAX_TOMAN = 100_000_000;

type Env = Record<string, string | undefined>;

export function readPaymentConfig(
  env: Env = process.env,
): PaymentConfig | null {
  const merchantId = env.ZARINPAL_MERCHANT_ID?.trim();
  const secret = env.PAYMENT_TOKEN_SECRET?.trim();
  const priceToman = Number(env.PREMIUM_PRICE_IRT);

  if (!merchantId || !secret || secret.length < 32) return null;
  if (
    !Number.isInteger(priceToman) ||
    priceToman < MIN_TOMAN ||
    priceToman > MAX_TOMAN
  ) {
    return null;
  }

  const siteUrl = env.SITE_URL?.trim().replace(/\/+$/, '') || null;
  return {
    merchantId,
    sandbox: env.ZARINPAL_SANDBOX === 'true',
    secret,
    priceToman,
    amountRial: priceToman * 10,
    siteUrl,
  };
}
