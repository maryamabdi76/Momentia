'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Info, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PosterPreview, type PosterData } from './PosterPreview';
import { toPersianDigits } from '../lib/digits';
import type { SkySnapshot } from '@/features/sky/lib/types';
import type { MomentData } from './CreateStepper';

type Props = {
  step: number;
  poster: Partial<PosterData>;
  /** Real sky for the chosen moment; null falls back to the static illustration. */
  sky: SkySnapshot | null;
  moment: MomentData;
  onBack: () => void;
};

/** Cream preview card + the per-step content shown beneath it. */
export function CreatePreview({ step, poster, sky, moment, onBack }: Props) {
  const t = useTranslations('CreatePage');
  const tPoster = useTranslations('Poster');
  const tMoment = useTranslations('CreatePage.step1');
  const tReceive = useTranslations('CreatePage.step3');

  // "شب یلدا", "نوروز" … when the chosen day matches one of the quick occasions.
  const occasion = [0, 1]
    .map((i) => ({
      label: tMoment(`occasions.${i}.label`),
      day: tMoment(`occasions.${i}.day`),
      month: tMoment(`occasions.${i}.month`),
    }))
    .find((o) => o.day === moment.day && o.month === moment.month)?.label;

  const caption = toPersianDigits(
    [
      moment.city,
      occasion,
      `${moment.day} ${moment.month} ${moment.year}`,
      moment.noExactTime ? null : moment.time,
    ]
      .filter(Boolean)
      .join(' · '),
  );

  return (
    <aside className="flex flex-col gap-5 md:sticky md:top-8">
      <div className="rounded-3xl bg-[#F4EFE6] p-6 text-[#1c2540] shadow-2xl md:p-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('preview.title')}</span>
          <span className="text-[#1c2540]/70">{t('preview.label')}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <PosterPreview
            data={poster}
            sky={sky}
            showDisclaimer={false}
            labels={{
              headerLine: tPoster('headerLine'),
              north: tPoster('north'),
              south: tPoster('south'),
              east: tPoster('east'),
              west: tPoster('west'),
              mapAlt: tPoster('mapAlt'),
              watermark: tPoster('watermark'),
              disclaimer: tPoster('disclaimer'),
              timeAt: tPoster('timeAt'),
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm font-medium">{caption}</p>
        <p className="mt-3 text-center text-xs text-[#1c2540]/70">
          {tPoster('disclaimer')}
        </p>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-[#33415B] px-6 py-5">
          <p className="text-sm font-semibold text-white">
            {t('infoCard.title')}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#AAB6CD]">
            {t('infoCard.body')}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#33415B] px-5 py-4">
          <Info className="size-5 shrink-0 text-[#CEB47B]" />
          <p className="text-sm leading-7 text-[#AAB6CD]">
            {t('preview.freeCopyNote')}
          </p>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-14 gap-2 rounded-xl border-[#33415B] bg-transparent text-sm font-bold text-white hover:bg-white/5"
            >
              <ArrowRight className="size-4" />
              {tReceive('ctaBack')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 gap-2 rounded-xl border-[#33415B] bg-transparent text-sm font-bold text-white hover:bg-white/5"
            >
              {tReceive('ctaShare')}
              <Share2 className="size-4" />
            </Button>
          </div>
          <p className="text-xs leading-6 text-[#AAB6CD]">
            {t('preview.shareNote')}
          </p>
        </>
      )}
    </aside>
  );
}
