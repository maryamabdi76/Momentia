/**
 * The slug of the payment this browser just started. Only the browser that holds it
 * can claim the paid status, so a stranger can't pick up someone else's payment.
 * It outlives the payment link (1 hour) so a payment made at the last minute, with
 * a slightly late webhook, can still be claimed.
 */
export const PENDING_COOKIE = 'vz_pending';
const MAX_AGE_SECONDS = 2 * 60 * 60;

export function pendingCookie(slug: string, secure: boolean): string {
  return `${PENDING_COOKIE}=${slug}; Path=/api/payments; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function readPendingCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === PENDING_COOKIE) return value.join('=') || null;
  }
  return null;
}
