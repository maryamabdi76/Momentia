'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/features/poster/components/Reveal';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { readGiftToken, unpackJson } from '@/features/poster/lib/gift-link';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';
import { useMoonWords } from '../hooks/use-moon-words';
import { parseMoonDraft } from '../lib/draft';
import type { MoonPosterData } from '../lib/moon-svg';
import { MoonPoster } from './MoonPoster';

/** What someone who opens a moon gift link sees: the poster, revealed on screen. */
export function MoonGiftView({ hash }: { hash: string }) {
  const t = useTranslations('GiftPage');
  const draft = useMemo(() => {
    const found = readGiftToken(hash);
    return found?.product === 'moon' ? parseMoonDraft(unpackJson(found.token)) : null;
  }, [hash]);

  const sky = useMemo(() => {
    if (!draft) return null;
    const { city, day, month, year, time, noExactTime } = draft.moment;
    return skyForMoment({ city, day, month, year, time, noExactTime })?.sky ?? null;
  }, [draft]);
  const { facts, labels } = useMoonWords(sky);

  const cta = (
    <Button asChild className="bg-[#CEB47B] p-6! font-bold text-[#0c142b] hover:bg-[#e0c180]">
      <a href="/moon">
        {t('ctaMoon')}
        <ArrowLeft data-icon="inline-end" />
      </a>
    </Button>
  );

  if (!draft || !facts) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">{t('invalidTitle')}</h1>
        <p className="text-sm leading-7 text-[#AAB6CD]">{t('invalidBody')}</p>
        {cta}
      </div>
    );
  }

  const { moment, personal } = draft;
  const poster: MoonPosterData = {
    ...personal,
    city: moment.city,
    dateLabel: toPersianDigits(`${moment.day} ${moment.month} ${moment.year}`),
    timeLabel: moment.noExactTime ? '' : toPersianDigits(moment.time),
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
      <div>
        <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
        <h1 className="mt-3 text-2xl font-bold leading-snug text-white">{t('title')}</h1>
        <p className="mt-3 text-sm leading-7 text-[#AAB6CD]">{t('moonBody')}</p>
      </div>
      <Reveal>
        <MoonPoster data={poster} facts={facts} labels={labels} watermark />
      </Reveal>
      {cta}
    </div>
  );
}
