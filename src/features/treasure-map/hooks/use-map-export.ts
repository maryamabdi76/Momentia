'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import {
  PREMIUM_PNG_WIDTH,
  downloadBlob,
} from '@/features/poster/lib/export-poster';
import { PremiumAccessError, ensurePremiumAccess } from '@/features/poster/lib/premium-access';
import { readPremiumToken, subscribePremiumToken } from '@/features/payments/lib/client';
import { createMapSvg, svgToPngBlob } from '../lib/export-map';
import { saveMapDraft } from '../lib/draft';
import type { StreetData } from '../lib/streets';
import type { TreasureMapLabels, TreasureMapData } from '../lib/map-svg';
import type { TreasureMapValues } from '../lib/schemas';

const BASENAME = 'momentia-treasure-map';

export type MapExport = {
  busy: 'png' | 'svg' | null;
  notice: 'error' | 'payment' | null;
  premiumUnlocked: boolean;
  /** Both files are premium: without a payment this opens the payment window instead. */
  downloadPng: () => void;
  downloadSvg: () => void;
};

/** The treasure map has no free download; every file is watermark-free and needs a verified payment. */
export function useMapExport(
  data: TreasureMapData,
  labels: TreasureMapLabels,
  draft: TreasureMapValues,
  streets: StreetData | null = null,
): MapExport {
  const [busy, setBusy] = useState<MapExport['busy']>(null);
  const [notice, setNotice] = useState<MapExport['notice']>(null);
  const premiumUnlocked = useSyncExternalStore(
    subscribePremiumToken,
    () => readPremiumToken() !== null,
    () => false,
  );

  const run = useCallback(
    (action: NonNullable<MapExport['busy']>, job: () => Promise<void>) => {
      if (busy) return;
      setBusy(action);
      setNotice(null);
      job()
        .catch((err: unknown) => {
          console.error(err);
          setNotice(err instanceof PremiumAccessError ? 'payment' : 'error');
        })
        .finally(() => setBusy(null));
    },
    [busy],
  );

  const paid = () =>
    ensurePremiumAccess(null, { product: 'map', save: () => saveMapDraft(draft) });
  const svg = () => createMapSvg({ data, labels, streets, watermark: false });

  return {
    busy,
    notice,
    premiumUnlocked,
    downloadPng: () =>
      run('png', async () => {
        if (!(await paid())) return;
        downloadBlob(await svgToPngBlob(await svg(), PREMIUM_PNG_WIDTH), `${BASENAME}.png`);
      }),
    downloadSvg: () =>
      run('svg', async () => {
        if (!(await paid())) return;
        downloadBlob(new Blob([await svg()], { type: 'image/svg+xml' }), `${BASENAME}.svg`);
      }),
  };
}
