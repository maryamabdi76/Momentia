import {
  type PremiumProduct,
  clearPremiumToken,
  readPremiumToken,
  startCheckout,
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
 * - Without one it saves the draft and sends the buyer to Zarinpal, then
 *   resolves `false`; the page leaves, and the callback brings them back to
 *   step 3 with a token.
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
