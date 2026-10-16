'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import type { SkySnapshot } from '@/features/sky/lib/types';
import {
  FREE_PNG_WIDTH,
  PREMIUM_PNG_WIDTH,
  downloadBlob,
} from '@/features/poster/lib/export-poster';
import { PremiumAccessError, ensurePremiumAccess } from '@/features/poster/lib/premium-access';
import type { PosterExport } from '@/features/poster/hooks/use-poster-export';
import {
  readPremiumToken,
  subscribePremiumToken,
} from '@/features/payments/lib/client';
import { createMoonSvg, svgToPngBlob } from '../lib/export-moon';
import { saveMoonDraft, type MoonDraft } from '../lib/draft';
import type { MoonPosterData } from '../lib/moon-svg';
import { useMoonWords } from './use-moon-words';

const BASENAME = 'momentia-moon';

/** Same shape as the sky poster's exporter, so Step 3 is shared. */
export function useMoonExport(
  data: MoonPosterData,
  sky: SkySnapshot | null,
  draft: MoonDraft,
): PosterExport {
  const tShare = useTranslations('CreatePage.step3');
  const { facts, labels } = useMoonWords(sky);
  const [busy, setBusy] = useState<PosterExport['busy']>(null);
  const [notice, setNotice] = useState<PosterExport['notice']>(null);
  const premiumUnlocked = useSyncExternalStore(
    subscribePremiumToken,
    () => readPremiumToken() !== null,
    () => false,
  );

  const run = useCallback(
    (action: NonNullable<PosterExport['busy']>, job: () => Promise<void>) => {
      if (busy) return;
      setBusy(action);
      setNotice(null);
      job()
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error(err);
          setNotice(err instanceof PremiumAccessError ? 'payment' : 'error');
        })
        .finally(() => setBusy(null));
    },
    [busy],
  );

  const svg = (watermark: boolean) => {
    if (!facts) throw new Error('no sky');
    return createMoonSvg({ data, facts, labels, watermark });
  };
  const png = async (watermark: boolean, width: number) =>
    svgToPngBlob(await svg(watermark), width);

  return {
    busy,
    notice,
    premiumUnlocked,
    freeLocked: false,
    downloadPng: () =>
      run('png', async () => {
        downloadBlob(await png(true, FREE_PNG_WIDTH), `${BASENAME}.png`);
      }),
    downloadSvg: () =>
      run('svg', async () => {
        downloadBlob(new Blob([await svg(true)], { type: 'image/svg+xml' }), `${BASENAME}.svg`);
      }),
    downloadPremium: () =>
      run('premium', async () => {
        const ok = await ensurePremiumAccess(
          null,
          { product: 'moon', save: () => saveMoonDraft(draft) },
        );
        if (!ok) return;
        downloadBlob(await png(false, PREMIUM_PNG_WIDTH), `${BASENAME}-premium.png`);
      }),
    share: () =>
      run('share', async () => {
        const url = window.location.origin;
        const text = tShare('shareText', { names: data.names });
        const blob = await png(true, FREE_PNG_WIDTH);
        const file = new File([blob], `${BASENAME}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text, url });
        } else if (navigator.share) {
          await navigator.share({ text, url });
        } else {
          await navigator.clipboard.writeText(`${text}\n${url}`);
          setNotice('copied');
        }
      }),
  };
}
