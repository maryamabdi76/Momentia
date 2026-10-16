'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Info, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/features/poster/lib/digits';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import type { PosterExport } from '@/features/poster/hooks/use-poster-export';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { useMoonWords } from '../hooks/use-moon-words';
import type { MoonPosterData } from '../lib/moon-svg';
import { MoonPoster } from './MoonPoster';

type Props = {
  step: number;
  poster: MoonPosterData;
  sky: SkySnapshot | null;
  moment: MomentData;
  onBack: () => void;
  exporter: PosterExport;
};

/** Cream preview card + the per-step content shown beneath it. */
export function MoonPreview({ step, poster, sky, moment, onBack, exporter }: Props) {
  const t = useTranslations('MoonPage');
  const tPreview = useTranslations('CreatePage');
  const tReceive = useTranslations('CreatePage.step3');
  const { facts, labels } = useMoonWords(sky);

  const caption = toPersianDigits(
    [
      moment.city,
      `${moment.day} ${moment.month} ${moment.year}`,
      moment.noExactTime ? null : moment.time,
    ]
      .filter(Boolean)
      .join(' · '),
  );

  return (
    <aside className="flex w-full flex-col gap-5 md:sticky md:top-8">
      <div className="m-auto w-full rounded-xl bg-[#F4EFE6] p-6 text-[#1c2540]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('preview.title')}</span>
          <span className="text-[#1c2540]/70">{tPreview('preview.label')}</span>
        </div>

        <div className="mx-auto mt-6 max-w-[420px] shadow-xl">
          {facts ? (
            <MoonPoster data={poster} facts={facts} labels={labels} />
          ) : (
            <div className="aspect-[2/3] w-full animate-pulse bg-[#1c2540]/10" />
          )}
        </div>

        <p className="mt-6 text-center text-sm font-medium">{caption}</p>
        <p className="mt-3 text-center text-xs text-[#1c2540]/70">{t('disclaimer')}</p>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-[#33415B] p-5">
          <p className="text-sm font-semibold text-[#E8D9B8]">{t('infoCard.title')}</p>
          <p className="mt-2 text-sm leading-7 text-[#AAB6CD]">{t('infoCard.body')}</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#33415B] p-5">
          <Info className="size-5 shrink-0 text-[#CEB47B]" />
          <p className="text-sm leading-7 text-[#AAB6CD]">{tPreview('preview.freeCopyNote')}</p>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="cursor-pointer gap-2 rounded-xl border-[#33415B] bg-transparent p-7! text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
            >
              <ArrowRight className="size-4" />
              {tReceive('ctaBack')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exporter.share}
              disabled={exporter.busy !== null}
              className="cursor-pointer gap-2 rounded-xl border-[#33415B] bg-transparent p-7! text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
            >
              {exporter.busy === 'share' ? tReceive('preparing') : tReceive('ctaShare')}
              <Share2 className="size-4" />
            </Button>
          </div>
          <p className="pb-8 text-xs leading-6 text-[#AAB6CD]">{tPreview('preview.shareNote')}</p>
        </>
      )}
    </aside>
  );
}
