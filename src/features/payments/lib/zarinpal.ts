/**
 * Minimal Zarinpal payment-gateway client (v4 REST).
 * Docs: https://www.zarinpal.com/docs/paymentGateway/connectToGateway.html
 *
 * Amounts are in rials (the default `currency`). Sandbox uses the same paths on
 * sandbox.zarinpal.com, with any UUID as the merchant id.
 */
export type ZarinpalConfig = { merchantId: string; sandbox: boolean };

type Fetch = typeof fetch;

const baseUrl = (c: ZarinpalConfig) =>
  c.sandbox ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';

/** Authorities are 36 characters: "A" (live) or "S" (sandbox) plus 35 alphanumerics. */
export const AUTHORITY_PATTERN = /^[AS][0-9A-Za-z]{35}$/;

export class ZarinpalError extends Error {
  code: number | null;
  constructor(message: string, code: number | null) {
    super(message);
    this.name = 'ZarinpalError';
    this.code = code;
  }
}

type Envelope = {
  // On failure Zarinpal sends `data: []` and puts the details in `errors`.
  data?: Record<string, unknown> | unknown[];
  errors?: { code?: number; message?: string } | unknown[];
};

async function post(
  config: ZarinpalConfig,
  path: string,
  body: Record<string, unknown>,
  fetchImpl: Fetch,
): Promise<Envelope> {
  const res = await fetchImpl(`${baseUrl(config)}/pg/v4/payment/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ merchant_id: config.merchantId, ...body }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  try {
    return (await res.json()) as Envelope;
  } catch {
    throw new ZarinpalError(`Zarinpal answered ${res.status} without JSON`, null);
  }
}

const failure = (env: Envelope, fallback: string) => {
  const err = !Array.isArray(env.errors) ? env.errors : undefined;
  return new ZarinpalError(err?.message ?? fallback, err?.code ?? null);
};

export async function requestPayment(
  config: ZarinpalConfig,
  input: {
    amountRial: number;
    description: string;
    callbackUrl: string;
    orderId?: string;
  },
  fetchImpl: Fetch = fetch,
): Promise<{ authority: string }> {
  const env = await post(
    config,
    'request',
    {
      amount: input.amountRial,
      currency: 'IRR',
      description: input.description,
      callback_url: input.callbackUrl,
      ...(input.orderId ? { metadata: { order_id: input.orderId } } : {}),
    },
    fetchImpl,
  );
  const data = Array.isArray(env.data) ? null : env.data;
  const authority = data?.authority;
  if (data?.code === 100 && typeof authority === 'string' && AUTHORITY_PATTERN.test(authority)) {
    return { authority };
  }
  throw failure(env, 'payment request rejected');
}

export type VerifyResult = {
  /** 100 = verified now, 101 = already verified earlier; both mean the money arrived. */
  paid: boolean;
  code: number | null;
  refId: number | null;
  cardPan: string | null;
};

export async function verifyPayment(
  config: ZarinpalConfig,
  input: { amountRial: number; authority: string },
  fetchImpl: Fetch = fetch,
): Promise<VerifyResult> {
  const env = await post(
    config,
    'verify',
    { amount: input.amountRial, authority: input.authority },
    fetchImpl,
  );
  const data = Array.isArray(env.data) ? null : env.data;
  const code = typeof data?.code === 'number' ? data.code : null;
  if (code === 100 || code === 101) {
    return {
      paid: true,
      code,
      refId: typeof data?.ref_id === 'number' ? data.ref_id : null,
      cardPan: typeof data?.card_pan === 'string' ? data.card_pan : null,
    };
  }
  const err = failure(env, 'verification failed');
  return { paid: false, code: err.code ?? code, refId: null, cardPan: null };
}

export const startPayUrl = (config: ZarinpalConfig, authority: string) =>
  `${baseUrl(config)}/pg/StartPay/${authority}`;
