'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PersonalizeData, MomentData } from './CreateStepper';

type Props = {
  personal: PersonalizeData;
  moment: MomentData;
  onBack: () => void;
};

export function Step3Receive({ personal, moment, onBack }: Props) {
  const t = useTranslations('CreatePage.step3');

  return (
    <div className="space-y-7">
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#ceb47b]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          {t('description', { names: personal.names })}
        </p>
      </div>

      {/* Digital — free */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{t('digitalTitle')}</p>
          <span className="rounded-full border border-[#ceb47b]/40 px-2.5 py-0.5 text-[11px] text-[#ceb47b]">
            {t('digitalBadge')}
          </span>
        </div>
        <p className="text-[12px] leading-6 text-white/45">{t('digitalDesc')}</p>
        <div className="flex flex-col gap-2.5">
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-white/20 bg-transparent text-white/70 hover:bg-white/5 gap-2"
          >
            <Download className="size-4" />
            {t('downloadPng')}
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-white/20 bg-transparent text-white/55 hover:bg-white/5 gap-2 text-xs"
          >
            <Download className="size-3.5" />
            {t('downloadSvg')}
          </Button>
        </div>
        <p className="text-[11px] text-white/30">{t('svgNote')}</p>
      </div>

      {/* Print — premium */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{t('printTitle')}</p>
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] text-white/45">
            {t('printBadge')}
          </span>
        </div>
        <p className="text-[12px] leading-6 text-white/45">{t('printDesc')}</p>
        <ul className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-white/50">
              <span className="size-1 rounded-full bg-[#ceb47b]/60 shrink-0" />
              {t(`printFeatures.${i}`)}
            </li>
          ))}
        </ul>
        <Button className="h-11 w-full rounded-xl bg-white/8 text-sm text-white hover:bg-white/12 gap-2">
          {t('removeLogoBtn')}
        </Button>
        <p className="text-[11px] text-white/30">{t('printRequestNote')}</p>
      </div>

      {/* Info accordion */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 space-y-3">
        <p className="text-xs font-semibold text-white/70">{t('infoTitle')}</p>
        {([0, 1, 2] as const).map((i) => (
          <div key={i} className="space-y-0.5">
            <p className="text-xs text-white/55">{t(`infoItems.${i}.title`)}</p>
            <p className="text-[11px] leading-5 text-white/30">{t(`infoItems.${i}.body`)}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-2xl border-white/20 bg-transparent text-white/60 hover:bg-white/5 gap-2"
          onClick={onBack}
        >
          <ArrowRight className="size-4" />
          {t('ctaBack')}
        </Button>
        <Button
          type="button"
          className="h-12 flex-[2] rounded-2xl bg-[#ceb47b] text-sm font-bold text-[#0c142b] hover:bg-[#d6c08a] gap-2"
        >
          {t('ctaShare')}
          <Share2 className="size-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-white/30">{t('noAccount')}</p>
    </div>
  );
}
