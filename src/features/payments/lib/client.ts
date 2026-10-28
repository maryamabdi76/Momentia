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

export async function validatePremiumToken(token: string): Promise<boolean> {
  const res = await fetch('/api/payments/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return false;
  return ((await res.json()) as { ok?: boolean }).ok === true;
}

export type ClaimResult =
  | { status: 'paid'; token: string }
  | { status: 'pending' | 'none' | 'unavailable' };

/**
 * Asks the server whether the payment this browser started has been confirmed. If so
 * it returns the signed token. Which payment is decided by an HttpOnly cookie.
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
    if (body?.status === 'pending' || body?.status === 'none') {
      return { status: body.status };
    }
  } catch {
    // offline or a server error: report it as unavailable below
  }
  return { status: 'unavailable' };
}

/**
 * Right after the buyer comes back from the gateway, the confirmation (a webhook) may
 * not have arrived yet, so ask every few seconds. Resolves with the token, or `null`
 * if nothing was confirmed in time, there is no payment to wait for, or it was aborted.
 */
export async function waitForPremiumToken({
  signal,
  timeoutMs = 90_000,
  intervalMs = 2_500,
}: { signal?: AbortSignal; timeoutMs?: number; intervalMs?: number } = {}): Promise<
  string | null
> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await claimPremiumToken();
    if (result.status === 'paid') return result.token;
    if (result.status === 'none') return null;
    if (signal?.aborted || Date.now() + intervalMs > deadline) return null;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (signal?.aborted) return null;
  }
}

/** Which product the buyer should be sent back to after paying. */
export type PremiumProduct = 'moon';

/** Creates the payment and returns the gateway URL to send the buyer to. */
export async function startCheckout(product?: PremiumProduct): Promise<string> {
  const res = await fetch(
    product ? `/api/payments/start?product=${product}` : '/api/payments/start',
    { method: 'POST' },
  );
  const body = (await res.json().catch(() => null)) as { url?: string } | null;
  if (!res.ok || !body?.url) throw new Error(`checkout failed (${res.status})`);
  return body.url;
}
