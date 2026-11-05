/** Browser side of the premium checkout. Nothing here is secret: the token is proof, signed by the server. */
const TOKEN_KEY = 'momentia.premium-token';
const CHANGE_EVENT = 'momentia:premium-token';

/** Must be NEXT_PUBLIC_ so SSR and the browser see the same value (avoids hydration mismatch). */
export const PREMIUM_PRICE_TOMAN =
  Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE_IRT ?? '') || null;

export function readPremiumToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storePremiumToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // private mode: the token then only lives for this page view
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearPremiumToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For useSyncExternalStore. */
export function subscribePremiumToken(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Same shape as ORDER_ID_PATTERN in store.ts (kept here so this file stays free of imports). */
const ORDER_ID_SHAPE = /^[A-Za-z0-9_-]{16}$/;

/**
 * The order id inside a premium token, shown to the buyer as a tracking
 * code. The token payload is only base64url JSON (the signature is what protects
 * it), so reading it in the browser reveals nothing that is not already theirs.
 */
export function paymentCodeFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[0];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes)) as { a?: unknown };
    return typeof data.a === 'string' && ORDER_ID_SHAPE.test(data.a) ? data.a : null;
  } catch {
    return null;
  }
}

export async function validatePremiumToken(token: string): Promise<boolean> {
  const res = await fetch('/api/payments/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return false;
  return ((await res.json()) as { ok?: boolean }).ok === true;
}

export type OrderStatus = 'pending' | 'submitted' | 'paid' | 'rejected';

export type ClaimResult =
  | { status: 'paid'; token: string }
  | { status: 'pending' | 'submitted' | 'rejected' | 'none' | 'unavailable' };

/**
 * Asks the server where the order this browser started stands and, once the owner has
 * approved it, for the signed token. Which order is decided by an HttpOnly cookie.
 */
export async function claimPremiumToken(): Promise<ClaimResult> {
  try {
    const res = await fetch('/api/payments/claim', { method: 'POST' });
    const body = (await res.json().catch(() => null)) as {
      status?: unknown;
      token?: unknown;
    } | null;
    if (body?.status === 'paid' && typeof body.token === 'string') {
      return { status: 'paid', token: body.token };
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

export type OrderInfo = {
  status: 'pending' | 'submitted';
  /** Exactly what to transfer, in tomans. */
  amountToman: number;
  card: { number: string; holder: string | null; bank: string | null };
};

export class CheckoutError extends Error {
  /** `rate_limited` and `busy` can clear up by themselves; the rest are setup or network problems. */
  reason: 'rate_limited' | 'busy' | 'unavailable' | 'notify_failed' | 'invalid_last4';
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
      e === 'rate_limited' || e === 'busy' || e === 'notify_failed' || e === 'invalid_last4'
        ? e
        : 'unavailable',
    );
  }
  return data;
}

/** Starts the order (or returns the one already open) and says what to pay and where. */
export async function startOrder(): Promise<OrderInfo> {
  const data = (await post('/api/payments/start')) as Partial<OrderInfo> | null;
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
    status: data.status,
    amountToman: data.amountToman,
    card: { number: card.number, holder: card.holder ?? null, bank: card.bank ?? null },
  };
}

/** "I paid": tells the owner, who then approves or rejects it on Telegram. */
export async function submitOrder(last4: string): Promise<void> {
  await post('/api/payments/submit', { last4 });
}

const OPEN_PAYMENT_EVENT = 'momentia:open-payment';

/**
 * Asks the payment window to open. Returns `false` if nothing is listening, which means
 * the page has no payment window and the caller must not wait for a payment.
 */
export function openPaymentDialog(): boolean {
  const event = new CustomEvent(OPEN_PAYMENT_EVENT, { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

/** For the payment window: runs `onOpen` whenever something asks for it, and marks the request handled. */
export function onOpenPaymentDialog(onOpen: () => void): () => void {
  const handler = (event: Event) => {
    event.preventDefault();
    onOpen();
  };
  window.addEventListener(OPEN_PAYMENT_EVENT, handler);
  return () => window.removeEventListener(OPEN_PAYMENT_EVENT, handler);
}
