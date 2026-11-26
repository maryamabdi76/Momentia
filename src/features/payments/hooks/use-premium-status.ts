'use client';

import { useSyncExternalStore } from 'react';
import {
  PREMIUM_PRICE_UNIT_TOMAN,
  paidFeatures,
  subscribePremiumToken,
} from '@/features/payments/lib/client';
import { FEATURES, covers, normalizeFeatures, quote, type Feature, type Product } from '../lib/pricing';

export type PremiumStatus = {
  /** This browser already holds a payment for `product` that covers every option in use. */
  unlocked: boolean;
  /** Tomans still to pay (only the difference after an earlier payment), `null` once unlocked or without a price unit. */
  amountToman: number | null;
};

/** The snapshot is a string so useSyncExternalStore can compare it: "" = paid for no option, null = no payment. */
const snapshot = (product: Product) => paidFeatures(product)?.join(',') ?? null;

/** Where the buyer stands for one product and the options it uses; reacts to payments made in this tab. */
export function usePremiumStatus(product: Product, features: readonly Feature[]): PremiumStatus {
  const paidKey = useSyncExternalStore(
    subscribePremiumToken,
    () => snapshot(product),
    () => null,
  );
  const paid =
    paidKey === null
      ? null
      : normalizeFeatures(
          product,
          FEATURES.filter((f) => paidKey.split(',').includes(f)),
        );
  const needed = normalizeFeatures(product, features);
  const unlocked = paid !== null && covers(paid, needed);
  const amountToman =
    unlocked || !PREMIUM_PRICE_UNIT_TOMAN
      ? null
      : quote(product, needed, paid, PREMIUM_PRICE_UNIT_TOMAN).amountToman;
  return { unlocked, amountToman };
}
