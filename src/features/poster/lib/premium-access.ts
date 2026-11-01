import {
  type PremiumProduct,
  claimPremiumToken,
  clearPremiumToken,
  readPremiumToken,
  startCheckout,
  storePremiumToken,
  validatePremiumToken,
} from '@/features/payments/lib/client';
import { saveDraft, type PosterDraft } from './draft';

export class PremiumAccessError extends Error {
  constructor() {
    super('premium checkout unavailable');
    this.name = 'PremiumAccessError';
  }
}

/**
 * Gate for the premium (watermark-free, 3000px) download.
 *
 * - With a valid payment token it resolves `true` and the file is built.
 * - If this browser already paid but never picked up the token (tab closed, slow
 *   confirmation), the token is claimed first, so nobody pays twice.
 * - Otherwise it saves the draft and sends the buyer to Variza, then resolves
 *   `false`; the page leaves, and the return route brings them back to step 3,
 *   which waits for the payment to be confirmed and picks up the token.
 * - It throws `PremiumAccessError` when checkout can't be started.
 */
export async function ensurePremiumAccess(
  draft: PosterDraft | null,
  options: { product?: PremiumProduct; save?: () => void } = {},
): Promise<boolean> {
  const token = readPremiumToken();
  if (token) {
    if (await validatePremiumToken(token).catch(() => false)) return true;
    clearPremiumToken();
  }

  const claimed = await claimPremiumToken();
  if (claimed.status === 'paid') {
    storePremiumToken(claimed.token);
    return true;
  }

  if (options.save) options.save();
  else if (draft) saveDraft(draft);
  let url: string;
  try {
    url = await startCheckout(options.product);
  } catch {
    throw new PremiumAccessError();
  }
  window.location.assign(url);
  return false;
}
