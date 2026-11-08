import { ORDER_ID_PATTERN, readOrder, type StoreConfig } from './store.ts';

type Fetch = typeof fetch;

/** Why a tracking code gave nothing. Both look the same to the caller of the API. */
export type RecoverResult =
  | { orderId: string; status: 'pending' | 'submitted' | 'paid' | 'rejected' }
  | null;

/**
 * Finds the order a buyer's tracking code points to, so a buyer who lost the browser tab
 * can get the file back. The code is the 16-character order id (about 95 bits of
 * randomness), so it cannot be guessed; the API also limits how often it may be tried.
 * The code is trimmed, because people paste it with spaces.
 */
export async function recoverOrder(
  store: StoreConfig,
  rawCode: unknown,
  fetchImpl: Fetch = fetch,
): Promise<RecoverResult> {
  if (typeof rawCode !== 'string') return null;
  const code = rawCode.trim();
  if (!ORDER_ID_PATTERN.test(code)) return null;
  const order = await readOrder(store, code, fetchImpl);
  if (!order) return null;
  return { orderId: code, status: order.status };
}
