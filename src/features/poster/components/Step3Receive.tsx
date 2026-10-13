'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Download, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PosterExport } from '../hooks/use-poster-export';
import type { MomentData, PersonalizeData } from './CreateStepper';

type Props = {
  personal: PersonalizeData;
  moment: MomentData;
  exporter: PosterExport;
};

function occasionKeepsakeLabel(
  moment: MomentData,
  tMoment: (key: string) => string,
): string | null {
  const match = [0, 1]
    .map((i) => ({
      keepsake: tMoment(`occasions.${i}.keepsake`),
      day: tMoment(`occasions.${i}.day`),
      month: tMoment(`occasions.${i}.month`),
    }))
    .find((o) => o.day === moment.day && o.month === moment.month);

  return match?.keepsake ?? null;
}

// Back / share actions live under the poster preview (see CreatePreview).
export function Step3Receive({ personal, moment, exporter }: Props) {
  const t = useTranslations('CreatePage.step3');
  const tMoment = useTranslations('CreatePage.step1');

  const occasionKeepsake = useMemo(
    () => occasionKeepsakeLabel(moment, tMoment),
    [moment, tMoment],
  );

  const icon = (action: PosterExport['busy'], cls = 'size-4') =>
    exporter.busy === action ? (
      <Loader2 className={`${cls} animate-spin`} />
    ) : (
      <Download className={cls} />
    );

  const description = occasionKeepsake
    ? t('descriptionOccasion', {
        occasion: occasionKeepsake,
        names: personal.names,
      })
    : t('description', { names: personal.names });

  return (
    <div className="space-y-7">
      {/* Step label + title */}
      <div>
        <p className="text-xs text-[#CEB47B]">{t('stepLabel')}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">{description}</p>
        <p className="mt-2 text-[12px] leading-6 text-white/40">
          {t('digitalOnlyNote')}
        </p>
      </div>

      {/* Digital — free */}
      <div className="rounded-2xl border border-[#33415B] bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-bold text-white">{t('digitalTitle')}</p>
          <span className="shrink-0 rounded-full border border-[#CEB47B]/40 px-2.5 py-0.5 text-[11px] text-[#CEB47B]">
            {t('digitalBadge')}
          </span>
        </div>
        <p className="text-[12px] leading-6 text-white/45">{t('digitalDesc')}</p>
        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={exporter.downloadPng}
            disabled={exporter.busy !== null}
            className="h-11 w-full rounded-xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
          >
            {icon('png')}
            {t('downloadPng')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={exporter.downloadSvg}
            disabled={exporter.busy !== null}
            className="h-11 w-full rounded-xl border-[#33415B] bg-transparent text-sm text-white/70 hover:bg-white/5 gap-2"
          >
            {icon('svg', 'size-4 opacity-70')}
            {t('downloadSvg')}
          </Button>
        </div>
        <p className="text-[11px] leading-5 text-white/30">{t('svgNote')}</p>
      </div>

      {/* Premium digital — no watermark */}
      <div className="rounded-2xl border border-[#33415B] bg-white/[0.04] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-bold text-white">{t('premiumTitle')}</p>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] text-white/45">
            {t('premiumBadge')}
          </span>
        </div>
        <p className="text-[12px] leading-6 text-white/45">{t('premiumDesc')}</p>
        <ul className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[12px] text-white/60"
            >
              <Check className="size-3.5 shrink-0 text-[#CEB47B]" />
              {t(`premiumFeatures.${i}`)}
            </li>
          ))}
        </ul>

        <Button
          type="button"
          onClick={exporter.downloadPremium}
          disabled={exporter.busy !== null}
          className="h-11 w-full rounded-xl bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
        >
          {icon('premium')}
          {t('premiumDownloadBtn')}
        </Button>
        <p className="text-center text-[11px] leading-5 text-white/30">
          {t('premiumNote')}
        </p>
      </div>

      {exporter.notice && (
        <p
          role="status"
          className={
            exporter.notice === 'error'
              ? 'text-center text-xs text-red-300'
              : 'text-center text-xs text-[#CEB47B]'
          }
        >
          {exporter.notice === 'error' ? t('exportError') : t('shareCopied')}
        </p>
      )}

      {/* No account note */}
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/30">
        <ShieldCheck className="size-3.5 shrink-0" />
        {t('noAccount')}
      </p>
    </div>
  );
}

/** Full-width tips row below preview + download columns (step 3). */
export function Step3ReceiveInfo() {
  const t = useTranslations('CreatePage.step3');

  return (
    <div className="space-y-4 border-t border-[#33415B] pt-10">
      <p className="text-center text-sm font-semibold text-white/80">
        {t('infoTitle')}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {([0, 1, 2] as const).map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[#33415B] bg-white/[0.03] px-4 py-4 space-y-1.5"
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
  );
}
