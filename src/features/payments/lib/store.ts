/**
 * Payment status shared between the webhook and the buyer's browser.
 *
 * Variza only tells us about a payment through a server-to-server webhook, which
 * lands on a different serverless instance from the one that started the payment,
 * so the status has to live somewhere shared. This talks to Upstash Redis over its
 * REST API (plain `fetch`, no extra dependency). On Vercel, add the Upstash Redis
 * integration from the Marketplace; it provides the two environment variables.
 */
export type StoreConfig = { url: string; token: string };

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export function readStoreConfig(env: Env = process.env): StoreConfig | null {
  const url = (env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL)?.trim().replace(/\/+$/, '');
  const token = (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN)?.trim();
  if (!url || !token || !url.startsWith('https://')) return null;
  return { url, token };
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreError';
  }
}

export type PaymentRecord = {
  status: 'pending' | 'paid';
  /** What we asked Variza to charge, in tomans. The webhook must match it. */
  amountToman: number;
  attemptCode?: string;
};

/** A link lives one hour; keep the record a while longer so a late webhook still lands. */
export const RECORD_TTL_SECONDS = 2 * 60 * 60;

const key = (slug: string) => `momentia:pay:${slug}`;

async function command(
  config: StoreConfig,
  args: (string | number)[],
  fetchImpl: Fetch,
): Promise<unknown> {
  const res = await fetchImpl(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  });
  const body = (await res.json().catch(() => null)) as {
    result?: unknown;
    error?: unknown;
  } | null;
  if (!res.ok || !body || typeof body.error === 'string') {
    throw new StoreError(
      typeof body?.error === 'string' ? body.error : `store answered ${res.status}`,
    );
  }
  return body.result;
}

export async function savePending(
  config: StoreConfig,
  slug: string,
  amountToman: number,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  const record: PaymentRecord = { status: 'pending', amountToman };
  await command(
    config,
    ['SET', key(slug), JSON.stringify(record), 'EX', RECORD_TTL_SECONDS],
    fetchImpl,
  );
}

export async function readRecord(
  config: StoreConfig,
  slug: string,
  fetchImpl: Fetch = fetch,
): Promise<PaymentRecord | null> {
  const raw = await command(config, ['GET', key(slug)], fetchImpl);
  if (typeof raw !== 'string') return null;
  try {
    const r = JSON.parse(raw) as Partial<PaymentRecord>;
    if (
      (r.status !== 'pending' && r.status !== 'paid') ||
      typeof r.amountToman !== 'number'
    ) {
      return null;
    }
    return {
      status: r.status,
      amountToman: r.amountToman,
      ...(typeof r.attemptCode === 'string' ? { attemptCode: r.attemptCode } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * - `paid`      recorded now, or was already recorded (the webhook is re-sent on failure)
 * - `unknown`   we never started this payment (e.g. another site on the same Variza account)
 * - `mismatch`  the paid amount isn't what we asked for, so it does not unlock anything
 */
export type MarkPaidResult = 'paid' | 'unknown' | 'mismatch';

export async function markPaid(
  config: StoreConfig,
  slug: string,
  paid: { baseAmountToman: number; attemptCode: string },
  fetchImpl: Fetch = fetch,
): Promise<MarkPaidResult> {
  const record = await readRecord(config, slug, fetchImpl);
  if (!record) return 'unknown';
  if (record.amountToman !== paid.baseAmountToman) return 'mismatch';
  if (record.status === 'paid') return 'paid';

  const next: PaymentRecord = { ...record, status: 'paid', attemptCode: paid.attemptCode };
  // XX: only if the record still exists, so an expired one is never resurrected.
  await command(
    config,
    ['SET', key(slug), JSON.stringify(next), 'EX', RECORD_TTL_SECONDS, 'XX'],
    fetchImpl,
  );
  return 'paid';
}
