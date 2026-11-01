import {
  type PremiumProduct,
  claimPremiumToken,
  clearPremiumToken,
  openPaymentDialog,
  readPremiumToken,
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
 * - If this browser's order has already been approved but the token was never picked up
 *   (tab closed, approval came later), the token is claimed first, so nobody pays twice.
 * - Otherwise it opens the card-to-card payment window and resolves `false`. The buyer
 *   stays on the page; when the owner approves, the window stores the token and the
 *   download button works.
 * - It throws `PremiumAccessError` if the page has no payment window to open.
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

  // The draft survives a reload while the buyer pays in their bank app.
  if (options.save) options.save();
  else if (draft) saveDraft(draft);

  if (!openPaymentDialog()) throw new PremiumAccessError();
  return false;
}
