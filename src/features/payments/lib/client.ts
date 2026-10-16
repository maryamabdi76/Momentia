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
