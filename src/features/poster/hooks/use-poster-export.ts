'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import type { SkySnapshot } from '@/features/sky/lib/types';
import type { PosterData, PosterLabels } from '../components/PosterPreview';
import {
  FREE_PNG_WIDTH,
  PREMIUM_PNG_WIDTH,
  createPosterSvg,
  downloadBlob,
  svgToPngBlob,
} from '../lib/export-poster';
import {
  readPremiumToken,
  subscribePremiumToken,
} from '@/features/payments/lib/client';
import type { PosterDraft } from '../lib/draft';
import { usesPremiumFeatures } from '../lib/premium-features';
import { PremiumAccessError, ensurePremiumAccess } from '../lib/premium-access';
import { trackEvent } from '@/lib/track';

export type ExportAction = 'png' | 'svg' | 'premium' | 'share';

export type PosterExport = {
  busy: ExportAction | null;
  /** Shown under the buttons. */
  notice: 'error' | 'copied' | 'payment' | null;
  /** The poster uses a premium option, so it has no free download (PNG, SVG and share are locked). */
  freeLocked: boolean;
  /** A payment has been verified in this browser session. */
  premiumUnlocked: boolean;
  downloadPng: () => void;
  downloadSvg: () => void;
  downloadPremium: () => void;
  share: () => void;
};

const BASENAME = 'momentia-night-sky';

export function usePosterExport(
  data: PosterData,
  sky: SkySnapshot | null,
  draft: PosterDraft,
): PosterExport {
  const tPoster = useTranslations('Poster');
  const tShare = useTranslations('CreatePage.step3');
  const [busy, setBusy] = useState<ExportAction | null>(null);
  const [notice, setNotice] = useState<PosterExport['notice']>(null);
  const premiumUnlocked = useSyncExternalStore(
    subscribePremiumToken,
    () => readPremiumToken() !== null,
    () => false,
  );

  const labels: PosterLabels = {
    headerLine: tPoster('headerLine'),
    north: tPoster('north'),
    south: tPoster('south'),
    east: tPoster('east'),
    west: tPoster('west'),
    mapAlt: tPoster('mapAlt'),
    watermark: tPoster('watermark'),
    disclaimer: tPoster('disclaimer'),
    timeAt: tPoster('timeAt'),
  };

  const freeLocked = usesPremiumFeatures(draft.personal);

  const run = useCallback(
    (action: ExportAction, job: () => Promise<void>) => {
      if (busy) return;
      setBusy(action);
      setNotice(null);
      trackEvent('export', { product: 'sky', action });
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

  const png = (watermark: boolean, width: number) =>
    createPosterSvg({ data, labels, sky, watermark }).then((svg) =>
      svgToPngBlob(svg, width),
    );

  return {
    busy,
    notice,
    premiumUnlocked,
    freeLocked,
    downloadPng: () =>
      run('png', async () => {
        if (freeLocked) return;
        downloadBlob(await png(true, FREE_PNG_WIDTH), `${BASENAME}.png`);
      }),
    downloadSvg: () =>
      run('svg', async () => {
        if (freeLocked) return;
        const svg = await createPosterSvg({ data, labels, sky, watermark: true });
        downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${BASENAME}.svg`);
      }),
    downloadPremium: () =>
      run('premium', async () => {
        if (!(await ensurePremiumAccess(draft))) return;
        downloadBlob(
          await png(false, PREMIUM_PNG_WIDTH),
          `${BASENAME}-premium.png`,
        );
      }),
    share: () =>
      run('share', async () => {
        if (freeLocked) return;
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
