'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/features/poster/components/Reveal';
import { useMapLabels } from '../hooks/use-map-labels';
import { readMapGift } from '../lib/gift-link';
import { MapPoster } from './MapPoster';

/** What someone who opens a treasure-map gift link sees: the map, revealed on screen. */
export function MapGiftView({ hash }: { hash: string }) {
  const t = useTranslations('GiftPage');
  const map = useMemo(() => readMapGift(hash), [hash]);
  const labels = useMapLabels(map?.milestones.length ?? 0);

  const cta = (
    <Button asChild className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]">
      <a href="/map">
        {t('ctaMap')}
        <ArrowLeft data-icon="inline-end" />
      </a>
    </Button>
  );

  if (!map) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">{t('invalidTitle')}</h1>
        <p className="text-sm leading-7 text-[#AAB6CD]">{t('invalidBody')}</p>
        {cta}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
      <div>
        <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-white">{t('mapTitle')}</h1>
        <p className="mt-3 text-sm leading-7 text-[#AAB6CD]">{t('mapBody')}</p>
      </div>
      <Reveal>
        <MapPoster data={map} labels={labels} />
      </Reveal>
      {cta}
    </div>
  );
}
