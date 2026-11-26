import { covers, isProduct, normalizeFeatures, type Feature, type Product } from './pricing.ts';

/** Browser side of the premium checkout. Nothing here is secret: the token is proof, signed by the server. */
const TOKEN_KEY = 'momentia.premium-token';
const CHANGE_EVENT = 'momentia:premium-token';
const tokenKey = (product: Product) => `${TOKEN_KEY}.${product}`;

/**
 * The base price unit in tomans (every price is a multiple of it; see pricing.ts). Must be
 * NEXT_PUBLIC_ so SSR and the browser see the same value (avoids hydration mismatch).
 */
export const PREMIUM_PRICE_UNIT_TOMAN =
  Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE_IRT ?? '') || null;

/** One payment buys one product: the moon poster's token never opens the treasure map. */
export function readPremiumToken(product: Product): string | null {
  try {
    return sessionStorage.getItem(tokenKey(product));
  } catch {
    return null;
  }
}

export function storePremiumToken(product: Product, token: string) {
  // A smaller payment (an older order, a tracking code typed in later) must never replace a
  // live token that already covers more: that would make the buyer pay the difference again.
  const current = tokenPayload(readPremiumToken(product));
  const incoming = tokenPayload(token);
  if (
    current &&
    incoming &&
    current.p === product &&
    typeof current.e === 'number' &&
    current.e > Date.now() &&
    covers(normalizeFeatures(product, current.f), normalizeFeatures(product, incoming.f))
  ) {
    return;
  }
  try {
    sessionStorage.setItem(tokenKey(product), token);
  } catch {
    // private mode: the token then only lives for this page view
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearPremiumToken(product: Product) {
  try {
    sessionStorage.removeItem(tokenKey(product));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For useSyncExternalStore. */
export function subscribePremiumToken(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function tokenPayload(token: string | null): { a?: unknown; e?: unknown; p?: unknown; f?: unknown } | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[0];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as { a?: unknown; e?: unknown; p?: unknown; f?: unknown };
  } catch {
    return null;
  }
}

/**
 * The premium options this browser's token for `product` pays for, or `null` with no token.
 * The payload is only base64url JSON (the signature is what protects it), so this is for
 * showing buttons; the server decides when it validates the token.
 */
export function paidFeatures(product: Product): Feature[] | null {
  const data = tokenPayload(readPremiumToken(product));
  if (!data || data.p !== product) return null;
  return normalizeFeatures(product, data.f);
}

/** Does the stored payment for `product` already pay for all of `needed`? For useSyncExternalStore. */
export function isPaidFor(product: Product, needed: readonly Feature[]): boolean {
  const paid = paidFeatures(product);
  return paid !== null && covers(paid, needed);
}

/** Same shape as ORDER_ID_PATTERN in store.ts (kept here so this file stays free of imports). */
const ORDER_ID_SHAPE = /^[A-Za-z0-9_-]{16}$/;

/**
 * The order id inside a premium token, shown to the buyer as a tracking
 * code. The token payload is only base64url JSON (the signature is what protects
 * it), so reading it in the browser reveals nothing that is not already theirs.
 */
export function paymentCodeFromToken(token: string | null): string | null {
  const a = tokenPayload(token)?.a;
  return typeof a === 'string' && ORDER_ID_SHAPE.test(a) ? a : null;
}

export async function validatePremiumToken(
  token: string,
  product: Product,
  features: readonly Feature[] = [],
): Promise<boolean> {
  const res = await fetch('/api/payments/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, product, features }),
  });
  if (!res.ok) return false;
  return ((await res.json()) as { ok?: boolean }).ok === true;
}

export type OrderStatus = 'pending' | 'submitted' | 'paid' | 'rejected';

export type ClaimResult =
  | { status: 'paid'; token: string; product?: Product }
  | { status: 'pending' | 'submitted' | 'rejected' | 'none' | 'unavailable' };

/**
 * Asks the server where the order this browser started stands and, once the owner has
 * approved it, for the signed token. Which order is decided by an HttpOnly cookie.
 */
export async function claimPremiumToken(product: Product): Promise<ClaimResult> {
  try {
    const res = await fetch('/api/payments/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
    });
    const body = (await res.json().catch(() => null)) as {
      status?: unknown;
      token?: unknown;
      product?: unknown;
    } | null;
    if (body?.status === 'paid' && typeof body.token === 'string') {
      return {
        status: 'paid',
        token: body.token,
        ...(isProduct(body.product) ? { product: body.product } : {}),
      };
    }
    if (
      body?.status === 'pending' ||
      body?.status === 'submitted' ||
      body?.status === 'rejected' ||
      body?.status === 'none'
    ) {
      return { status: body.status };
    }
  } catch {
    // offline or a server error: report it as unavailable below
  }
  return { status: 'unavailable' };
}

/** Gets an order back by its tracking code (for a buyer who lost the tab). */
export async function recoverByCode(
  code: string,
): Promise<ClaimResult | { status: 'rate_limited' }> {
  try {
    const res = await fetch('/api/payments/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.status === 429) return { status: 'rate_limited' };
    const body = (await res.json().catch(() => null)) as {
      status?: unknown;
      token?: unknown;
      product?: unknown;
    } | null;
    if (body?.status === 'paid' && typeof body.token === 'string') {
      return {
        status: 'paid',
        token: body.token,
        ...(isProduct(body.product) ? { product: body.product } : {}),
      };
    }
    if (
      body?.status === 'pending' ||
      body?.status === 'submitted' ||
      body?.status === 'rejected' ||
      body?.status === 'none'
    ) {
      return { status: body.status };
    }
  } catch {
    // offline: reported as unavailable below
  }
  return { status: 'unavailable' };
}

export type OrderInfo = {
  product: Product;
  features: Feature[];
  status: 'pending' | 'submitted';
  /** Tracking code (the order id): lets the buyer get the file back from /track. */
  code: string | null;
  /** Exactly what to transfer, in tomans. */
  amountToman: number;
  card: { number: string; holder: string | null; bank: string | null };
};

export class CheckoutError extends Error {
  /** `rate_limited` and `busy` can clear up by themselves; the rest are setup or network problems. */
  reason:
    | 'rate_limited'
    | 'busy'
    | 'unavailable'
    | 'notify_failed'
    | 'invalid_last4'
    | 'already_covered';
  constructor(reason: CheckoutError['reason']) {
    super(`checkout failed: ${reason}`);
    this.name = 'CheckoutError';
    this.reason = reason;
  }
}

async function post(path: string, body?: unknown): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      ...(body === undefined
        ? {}
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new CheckoutError('unavailable');
  }
  const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
  if (!res.ok) {
    const e = data?.error;
    throw new CheckoutError(
      e === 'rate_limited' ||
      e === 'busy' ||
      e === 'notify_failed' ||
      e === 'invalid_last4' ||
      e === 'already_covered'
        ? e
        : 'unavailable',
    );
  }
  return data;
}

/** Starts the order (or returns the one already open) and says what to pay and where. */
export async function startOrder(request: PaymentRequest): Promise<OrderInfo> {
  const data = (await post('/api/payments/start', {
    product: request.product,
    features: request.features,
    ...(request.token ? { token: request.token } : {}),
  })) as Partial<OrderInfo> | null;
  const card = data?.card;
  if (
    !data ||
    (data.status !== 'pending' && data.status !== 'submitted') ||
    typeof data.amountToman !== 'number' ||
    !card ||
    typeof card.number !== 'string'
  ) {
    throw new CheckoutError('unavailable');
  }
  return {
    product: request.product,
    features: normalizeFeatures(request.product, data.features),
    status: data.status,
    code: typeof data.code === 'string' && ORDER_ID_SHAPE.test(data.code) ? data.code : null,
    amountToman: data.amountToman,
    card: { number: card.number, holder: card.holder ?? null, bank: card.bank ?? null },
  };
}

/** "I paid": tells the owner, who then approves or rejects it on Telegram. */
export async function submitOrder(product: Product, last4: string): Promise<void> {
  await post('/api/payments/submit', { product, last4 });
}

const OPEN_PAYMENT_EVENT = 'momentia:open-payment';

/** What the buyer is paying for; `token` is an earlier payment for the same product (only the difference is owed). */
export type PaymentRequest = {
  product: Product;
  features: Feature[];
  token?: string | null;
};

/**
 * Asks the payment window to open. Returns `false` if nothing is listening, which means
 * the page has no payment window and the caller must not wait for a payment.
 */
export function openPaymentDialog(request: PaymentRequest): boolean {
  const event = new CustomEvent<PaymentRequest>(OPEN_PAYMENT_EVENT, {
    cancelable: true,
    detail: request,
  });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

/** For the payment window: runs `onOpen` whenever something asks for it, and marks the request handled. */
export function onOpenPaymentDialog(onOpen: (request: PaymentRequest) => void): () => void {
  const handler = (event: Event) => {
    event.preventDefault();
    onOpen((event as CustomEvent<PaymentRequest>).detail);
  };
  window.addEventListener(OPEN_PAYMENT_EVENT, handler);
  return () => window.removeEventListener(OPEN_PAYMENT_EVENT, handler);
}
