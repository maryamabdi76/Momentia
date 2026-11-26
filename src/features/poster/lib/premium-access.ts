import {
  claimPremiumToken,
  clearPremiumToken,
  openPaymentDialog,
  paidFeatures,
  readPremiumToken,
  storePremiumToken,
  validatePremiumToken,
} from '@/features/payments/lib/client';
import {
  covers,
  normalizeFeatures,
  type Feature,
  type Product,
} from '@/features/payments/lib/pricing';
import { saveDraft, type PosterDraft } from './draft';

export class PremiumAccessError extends Error {
  constructor() {
    super('premium checkout unavailable');
    this.name = 'PremiumAccessError';
  }
}

/**
 * Gate for the premium (watermark-free, 3000px) download of one product.
 *
 * A payment belongs to one product, and for the sky poster to the premium options it was
 * paid with: the moon poster's payment never opens the treasure map, and a sky poster that
 * later switches on another option needs a new payment (only the difference is asked).
 *
 * - With a valid token for this product that covers `features` it resolves `true`.
 * - If this browser's order was approved but the token was never picked up (tab closed,
 *   approval came later), the token is claimed first, so nobody pays twice.
 * - Otherwise it opens the card-to-card payment window and resolves `false`. The buyer
 *   stays on the page; when the owner approves, the window stores the token and the
 *   download button works.
 * - It throws `PremiumAccessError` if the page has no payment window to open.
 */
export async function ensurePremiumAccess(
  draft: PosterDraft | null,
  options: { product: Product; features?: readonly Feature[]; save?: () => void },
): Promise<boolean> {
  const { product } = options;
  const features = normalizeFeatures(product, options.features ?? []);

  const token = readPremiumToken(product);
  if (token) {
    if (await validatePremiumToken(token, product, features).catch(() => false)) return true;
    // A genuine token that does not cover the new options is kept: it is the proof of what
    // was already paid, so the next payment is only the difference.
    if (!(await validatePremiumToken(token, product, []).catch(() => false))) {
      clearPremiumToken(product);
    }
  }

  const claimed = await claimPremiumToken(product);
  if (claimed.status === 'paid') {
    storePremiumToken(product, claimed.token);
    if (await validatePremiumToken(claimed.token, product, features).catch(() => false)) {
      return true;
    }
  }

  // The draft survives a reload while the buyer pays in their bank app.
  if (options.save) options.save();
  else if (draft) saveDraft(draft);

  const earlier = readPremiumToken(product);
  const paid = paidFeatures(product);
  const upgrade = earlier !== null && paid !== null && !covers(paid, features);
  if (!openPaymentDialog({ product, features, token: upgrade ? earlier : null })) {
    throw new PremiumAccessError();
  }
  return false;
}
