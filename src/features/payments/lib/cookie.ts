/**
 * The id of the order this browser started. Only the browser that holds it can see the
 * order's status or claim the paid file, so a stranger can't pick up someone else's payment.
 * It lasts as long as a submitted order does, so a buyer who comes back the next day, after
 * the owner has approved, can still get the file.
 */
export const ORDER_COOKIE = 'mm_order';
const MAX_AGE_SECONDS = 24 * 60 * 60;

export function orderCookie(orderId: string, secure: boolean): string {
  return `${ORDER_COOKIE}=${orderId}; Path=/api/payments; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function readOrderCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === ORDER_COOKIE) return value.join('=') || null;
  }
  return null;
}
