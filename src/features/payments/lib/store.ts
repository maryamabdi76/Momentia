import { randomBytes, randomInt } from 'node:crypto';

/**
 * Orders for the manual card-to-card checkout, kept in Upstash Redis over its REST
 * API (plain `fetch`, no extra dependency). The browser, the "I paid" request and the
 * Telegram approval all land on different serverless instances, so the status has to
 * live somewhere shared. On Vercel, add the Upstash Redis integration from the
 * Marketplace; it provides the two environment variables.
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

/** Order ids are random and unguessable; this keeps cookies and storage keys well-formed. */
export const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{16}$/;

export type OrderStatus = 'pending' | 'submitted' | 'paid' | 'rejected';

export type Order = {
  status: OrderStatus;
  /** What the buyer must transfer, in tomans: the price plus a few tomans that make it unique. */
  amountToman: number;
};

/** An unpaid order (and the amount it reserves) lives one hour. */
export const PENDING_TTL_SECONDS = 60 * 60;
/** After "I paid" the owner needs time to look, so the order is kept for a day. */
export const SUBMITTED_TTL_SECONDS = 24 * 60 * 60;

const orderKey = (id: string) => `momentia:order:${id}`;
const amountKey = (amountToman: number) => `momentia:amount:${amountToman}`;

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

/**
 * Counts one more hit for `key` inside a window and says whether it is still allowed.
 * Used so one visitor cannot use up the few unique amounts or spam the owner.
 */
export async function allow(
  config: StoreConfig,
  key: string,
  max: number,
  windowSeconds: number,
  fetchImpl: Fetch = fetch,
): Promise<boolean> {
  const k = `momentia:limit:${key}`;
  const count = Number(await command(config, ['INCR', k], fetchImpl));
  if (count === 1) await command(config, ['EXPIRE', k, windowSeconds], fetchImpl);
  return count <= max;
}

/** `true` the first time, `false` while the lock is held. For ignoring a double click. */
export async function acquireLock(
  config: StoreConfig,
  name: string,
  seconds: number,
  fetchImpl: Fetch = fetch,
): Promise<boolean> {
  const result = await command(
    config,
    ['SET', `momentia:lock:${name}`, '1', 'EX', seconds, 'NX'],
    fetchImpl,
  );
  return result === 'OK';
}

/** How many tomans above the price an order may add to make its amount unique. */
export const MAX_AMOUNT_OFFSET = 99;

/**
 * Starts an order for `priceToman` plus a small random extra (1 to 99 tomans). The owner
 * matches a deposit to an order by that exact amount, so no two open orders may share it:
 * the amount is reserved with SET NX before the order is saved.
 * Returns `null` when every amount is taken (unlikely, and the buyer can retry soon).
 */
export async function createOrder(
  config: StoreConfig,
  priceToman: number,
  fetchImpl: Fetch = fetch,
): Promise<{ id: string; amountToman: number } | null> {
  const id = randomBytes(12).toString('base64url');
  for (let attempt = 0; attempt < 12; attempt++) {
    const amountToman = priceToman + randomInt(1, MAX_AMOUNT_OFFSET + 1);
    const reserved = await command(
      config,
      ['SET', amountKey(amountToman), id, 'EX', PENDING_TTL_SECONDS, 'NX'],
      fetchImpl,
    );
    if (reserved !== 'OK') continue;
    const order: Order = { status: 'pending', amountToman };
    await command(
      config,
      ['SET', orderKey(id), JSON.stringify(order), 'EX', PENDING_TTL_SECONDS],
      fetchImpl,
    );
    return { id, amountToman };
  }
  return null;
}

export async function readOrder(
  config: StoreConfig,
  id: string,
  fetchImpl: Fetch = fetch,
): Promise<Order | null> {
  const raw = await command(config, ['GET', orderKey(id)], fetchImpl);
  if (typeof raw !== 'string') return null;
  try {
    const o = JSON.parse(raw) as Partial<Order>;
    const statuses: OrderStatus[] = ['pending', 'submitted', 'paid', 'rejected'];
    if (!statuses.includes(o.status as OrderStatus) || typeof o.amountToman !== 'number') {
      return null;
    }
    return { status: o.status as OrderStatus, amountToman: o.amountToman };
  } catch {
    return null;
  }
}

async function write(
  config: StoreConfig,
  id: string,
  order: Order,
  seconds: number,
  fetchImpl: Fetch,
): Promise<boolean> {
  // XX: only while the order still exists, so an expired one is never resurrected.
  const result = await command(
    config,
    ['SET', orderKey(id), JSON.stringify(order), 'EX', seconds, 'XX'],
    fetchImpl,
  );
  return result === 'OK';
}

/**
 * The buyer says they paid. Only a pending order can be submitted; its reservation of the
 * amount is extended to match, so the amount stays unique until the owner has decided.
 */
export async function markSubmitted(
  config: StoreConfig,
  id: string,
  fetchImpl: Fetch = fetch,
): Promise<'submitted' | 'unknown' | 'not_pending'> {
  const order = await readOrder(config, id, fetchImpl);
  if (!order) return 'unknown';
  if (order.status !== 'pending') return 'not_pending';
  if (!(await write(config, id, { ...order, status: 'submitted' }, SUBMITTED_TTL_SECONDS, fetchImpl))) {
    return 'unknown';
  }
  await command(config, ['EXPIRE', amountKey(order.amountToman), SUBMITTED_TTL_SECONDS], fetchImpl);
  return 'submitted';
}

/**
 * The owner's decision. Only an order the buyer has submitted can be decided, and a
 * decision already taken is never flipped by a repeated or late button press.
 * Rejecting frees the amount again.
 */
export async function decideOrder(
  config: StoreConfig,
  id: string,
  decision: 'paid' | 'rejected',
  fetchImpl: Fetch = fetch,
): Promise<'paid' | 'rejected' | 'unknown' | 'already_decided' | 'not_submitted'> {
  const order = await readOrder(config, id, fetchImpl);
  if (!order) return 'unknown';
  if (order.status === 'paid' || order.status === 'rejected') return 'already_decided';
  if (order.status !== 'submitted') return 'not_submitted';
  if (!(await write(config, id, { ...order, status: decision }, SUBMITTED_TTL_SECONDS, fetchImpl))) {
    return 'unknown';
  }
  if (decision === 'rejected') {
    await command(config, ['DEL', amountKey(order.amountToman)], fetchImpl);
  }
  return decision;
}
