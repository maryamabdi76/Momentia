'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { getExportFormat, type ExportFormatId } from '@/features/poster/lib/export-formats';
import { renderFormat } from '@/features/poster/lib/render-format';
import {
  PREMIUM_PNG_WIDTH,
  downloadBlob,
} from '@/features/poster/lib/export-poster';
import { PremiumAccessError, ensurePremiumAccess } from '@/features/poster/lib/premium-access';
import { readPremiumToken, subscribePremiumToken } from '@/features/payments/lib/client';
import { createMapSvg, svgToPngBlob } from '../lib/export-map';
import { saveMapDraft } from '../lib/draft';
import { mapAspect, mapPaperColor, type TreasureMapLabels, type TreasureMapData } from '../lib/map-svg';
import type { TreasureMapValues } from '../lib/schemas';

const BASENAME = 'momentia-treasure-map';

export type MapExport = {
  busy: 'premium' | 'svg' | null;
  notice: 'error' | 'payment' | null;
  premiumUnlocked: boolean;
  /** Every file is premium: without a payment this opens the payment window instead. */
  downloadPremium: (format: ExportFormatId) => void;
  downloadSvg: () => void;
};

/** The treasure map has no free download; every file is watermark-free and needs a verified payment. */
export function useMapExport(
  data: TreasureMapData,
  labels: TreasureMapLabels,
  draft: TreasureMapValues,
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
  const svg = () => createMapSvg({ data, labels, watermark: false });

  return {
    busy,
    notice,
    premiumUnlocked,
    downloadPremium: (format) =>
      run('premium', async () => {
        if (!(await paid())) return;
        const aspect = mapAspect(data.layout);
        if (format === 'poster') {
          // the same pixel count whichever way the sheet is turned
          const wide = aspect > 1 ? Math.round(PREMIUM_PNG_WIDTH * 1.5) : PREMIUM_PNG_WIDTH;
          downloadBlob(await svgToPngBlob(await svg(), wide, aspect), `${BASENAME}.png`);
          return;
        }
        const paper = mapPaperColor(data.theme);
        const { extension } = getExportFormat(format);
        downloadBlob(
          await renderFormat(await svg(), format, { paper, mat: paper }, aspect),
          `${BASENAME}-${format}.${extension}`,
        );
      }),
    downloadSvg: () =>
      run('svg', async () => {
        if (!(await paid())) return;
        downloadBlob(new Blob([await svg()], { type: 'image/svg+xml' }), `${BASENAME}.svg`);
      }),
  };
}
