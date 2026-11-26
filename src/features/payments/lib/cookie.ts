import type { Product } from './pricing.ts';

/**
 * The id of the order this browser started for one product (each product has its own). Only the browser that holds it can see the
 * order's status or claim the paid file, so a stranger can't pick up someone else's payment.
 * It lasts as long as a submitted order does, so a buyer who comes back the next day, after
 * the owner has approved, can still get the file.
 */
export const orderCookieName = (product: Product) => `mm_order_${product}`;
const MAX_AGE_SECONDS = 24 * 60 * 60;

export function orderCookie(product: Product, orderId: string, secure: boolean): string {
  return `${orderCookieName(product)}=${orderId}; Path=/api/payments; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function readOrderCookie(header: string | null, product: Product): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === orderCookieName(product)) return value.join('=') || null;
  }
  return null;
}
