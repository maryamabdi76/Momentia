/** The authority of the payment this browser just started; the callback must match it. */
export const PENDING_COOKIE = 'zp_pending';

export function pendingCookie(authority: string, secure: boolean): string {
  return `${PENDING_COOKIE}=${authority}; Path=/api/payments; Max-Age=3600; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function clearPendingCookie(secure: boolean): string {
  return `${PENDING_COOKIE}=; Path=/api/payments; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function readPendingCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === PENDING_COOKIE) return value.join('=') || null;
  }
  return null;
}
