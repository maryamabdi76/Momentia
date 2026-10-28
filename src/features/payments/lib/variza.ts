import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Minimal Variza client (card-to-card gateway that confirms payments by reading
 * the bank's deposit SMS). The public API is two steps:
 *
 *   1. POST /api/v1/pay          creates a payment link (amounts are in tomans)
 *   2. POST <your callback_url>  a signed `payment.paid` webhook after the deposit
 *
 * There is no "verify" call: the signed webhook is the only proof of payment, and
 * the buyer's return to `return_url` proves nothing. The `callback_url` itself is
 * registered once in the Variza profile, not sent with each request.
 */
export const VARIZA_BASE_URL = 'https://variza.ir/api/v1';
export const VARIZA_PAY_HOST = 'variza.ir';

type Fetch = typeof fetch;

/** Variza slugs look like "aB3xY9…"; this keeps cookies and storage keys well-formed. */
export const SLUG_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export type VarizaConfig = { apiKey: string };

export class VarizaError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'VarizaError';
    this.status = status;
  }
}

export async function createPaymentLink(
  config: VarizaConfig,
  input: {
    /** Tomans, minimum 1000. */
    amountToman: number;
    /** Must be https:// */
    returnUrl: string;
    title?: string;
    /** Variza advises against anything longer than "1h". */
    expiresIn?: '30m' | '1h' | '2h' | '6h' | '1d' | '3d' | '1w' | 'never';
  },
  fetchImpl: Fetch = fetch,
): Promise<{ slug: string; payUrl: string }> {
  const res = await fetchImpl(`${VARIZA_BASE_URL}/pay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      amount: input.amountToman,
      return_url: input.returnUrl,
      ...(input.title ? { title: input.title } : {}),
      expires_in: input.expiresIn ?? '1h',
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  const body = (await res.json().catch(() => null)) as {
    slug?: unknown;
    pay_url?: unknown;
    message?: unknown;
  } | null;

  if (res.status !== 201 && res.status !== 200) {
    const message = typeof body?.message === 'string' ? body.message : 'payment link rejected';
    throw new VarizaError(message, res.status);
  }

  const slug = body?.slug;
  const payUrl = body?.pay_url;
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug) || typeof payUrl !== 'string') {
    throw new VarizaError('unexpected payment link response', res.status);
  }
  // The browser is sent to this URL, so only accept Variza's own pay page.
  let parsed: URL;
  try {
    parsed = new URL(payUrl);
  } catch {
    throw new VarizaError('unexpected pay_url', res.status);
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== VARIZA_PAY_HOST) {
    throw new VarizaError('unexpected pay_url host', res.status);
  }
  return { slug, payUrl };
}

/**
 * Checks `X-Webhook-Signature` (`sha256=<hex>`), an HMAC-SHA256 of the RAW body.
 * Pass the body exactly as received, never a re-serialised JSON string.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const expected = Buffer.from(
    'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex'),
  );
  const given = Buffer.from(signatureHeader.trim());
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type PaidEvent = {
  slug: string;
  attemptCode: string;
  /** The amount we asked for when creating the link, in tomans. */
  baseAmountToman: number;
};

/**
 * Reads a verified webhook body. Returns the paid event, or null for anything
 * else (other events, unpaid statuses, malformed bodies).
 */
export function parsePaidEvent(rawBody: string): PaidEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const e = data as Record<string, unknown>;

  if (e.event !== 'payment.paid' || e.status !== 'paid') return null;
  if (typeof e.slug !== 'string' || !SLUG_PATTERN.test(e.slug)) return null;
  if (typeof e.attempt_code !== 'string' || !e.attempt_code) return null;
  if (typeof e.base_amount !== 'number' || !Number.isInteger(e.base_amount)) return null;

  return { slug: e.slug, attemptCode: e.attempt_code, baseAmountToman: e.base_amount };
}
