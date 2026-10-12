'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PersonalizeData } from './CreateStepper';

type Props = {
  personal: PersonalizeData;
};

// Back / share actions live under the poster preview (see CreatePreview).
export function Step3Receive({ personal }: Props) {
  const t = useTranslations('CreatePage.step3');

  return (
    <div className="space-y-7">
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          {t('description', { names: personal.names })}
        </p>
      </div>

      {/* Digital — free */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-white">{t('digitalTitle')}</p>
          <span className="rounded-full border border-[#CEB47B]/40 px-2.5 py-0.5 text-[11px] text-[#CEB47B]">
            {t('digitalBadge')}
          </span>
        </div>
        <p className="text-[12px] leading-6 text-white/45">
          {t('digitalDesc')}
        </p>
        <div className="flex flex-col gap-2.5">
          <Button className="h-11 w-full rounded-xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2">
            <ArrowLeft className="size-4" />
            {t('downloadPng')}
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-white/20 bg-transparent text-white/55 hover:bg-white/5 gap-2 text-sm"
          >
            {t('downloadSvg')}
          </Button>
        </div>
        <p className="text-[11px] text-white/30">{t('svgNote')}</p>
      </div>

      {/* Print — premium */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-white">{t('printTitle')}</p>
        </div>
        <p className="text-[12px] leading-6 text-white/45">{t('printDesc')}</p>
        <ul className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[12px] text-white/60"
            >
              <Check className="size-3.5 shrink-0 text-[#CEB47B]" />
              {t(`printFeatures.${i}`)}
            </li>
          ))}
        </ul>

        <Button className="h-11 w-full rounded-xl bg-white/[0.08] text-sm text-white hover:bg-white/[0.12] gap-2">
          <ArrowLeft className="size-4" />
          {t('removeLogoBtn')}
        </Button>
        <p className="text-center text-[11px] text-white/30">
          {t('printRequestNote')}
        </p>
      </div>

      {/* No account note */}
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/30">
        <ShieldCheck className="size-3.5" />
        {t('noAccount')}
      </p>

      {/* Info section */}
      <div className="space-y-4 pt-2">
        <p className="text-center text-sm font-semibold text-white/80">
          {t('infoTitle')}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {([0, 1, 2] as const).map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 space-y-1.5"
            >
              <p className="text-xs font-semibold text-white/70">
                {t(`infoItems.${i}.title`)}
              </p>
              <p className="text-[11px] leading-5 text-white/35">
                {t(`infoItems.${i}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
