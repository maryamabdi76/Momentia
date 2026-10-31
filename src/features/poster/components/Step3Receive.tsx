'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Crown, Download, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { formatToman } from '../lib/digits';
import { Button } from '@/components/ui/button';
import type { PosterExport } from '../hooks/use-poster-export';
import type { MomentData, PersonalizeData } from './CreateStepper';

type Props = {
  personal: Pick<PersonalizeData, 'names'>;
  moment: MomentData;
  exporter: PosterExport;
  payResult: 'ok' | 'cancelled' | 'failed' | null;
  /** Drop the premium options (full-page sky, constellation figures) to get the free download. */
  onUseFreeLayout?: () => void;
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
export function Step3Receive({
  personal,
  moment,
  exporter,
  payResult,
  onUseFreeLayout,
}: Props) {
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

  const locked = exporter.freeLocked;

  const description = occasionKeepsake
    ? t('descriptionOccasion', {
        occasion: occasionKeepsake,
        names: personal.names,
      })
    : t('description', { names: personal.names });

  const digitalCard = (
    <div
      className={`rounded-2xl border border-[#33415B] bg-[#142039] p-5 space-y-4 ${locked ? 'opacity-90' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-white">{t('digitalTitle')}</p>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#CEB47B]/40 px-2.5 py-0.5 text-[11px] text-[#CEB47B]">
          {locked && <Lock aria-hidden className="size-3" />}
          {locked ? t('freeLocked.badge') : t('digitalBadge')}
        </span>
      </div>
      {locked ? (
        <div className="space-y-3 rounded-xl border border-[#CEB47B]/30 bg-[#CEB47B]/5 p-3.5">
          <p className="flex items-start gap-2 text-[12px] leading-6 text-[#E8D9B8]">
            <Crown aria-hidden className="mt-1 size-3.5 shrink-0 text-[#CEB47B]" />
            {t('freeLocked.body')}
          </p>
          {onUseFreeLayout && (
            <Button
              type="button"
              variant="outline"
              onClick={onUseFreeLayout}
              className="h-auto min-h-10 w-full whitespace-normal border-[#33415B] bg-transparent py-2 text-center text-xs leading-5 text-white/80 hover:bg-white/5"
            >
              {t('freeLocked.useFree')}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-[12px] leading-6 text-[#AAB6CD]">
          {t('digitalDesc')}
        </p>
      )}
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          onClick={exporter.downloadPng}
          disabled={locked || exporter.busy !== null}
          className="h-11 w-full bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
        >
          {icon('png')}
          {t('downloadPng')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={exporter.downloadSvg}
          disabled={locked || exporter.busy !== null}
          className="h-11 w-full border-[#33415B] bg-transparent text-sm text-white/70 hover:bg-white/5 gap-2"
        >
          {icon('svg', 'size-4 opacity-70')}
          {t('downloadSvg')}
        </Button>
      </div>
      {!locked && (
        <p className="text-[11px] leading-5 text-[#AAB6CD]">{t('svgNote')}</p>
      )}
    </div>
  );

  const premiumCard = (
    <div className="rounded-2xl border border-[#CEB47B] bg-[#142039] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-bold text-[#CEB47B]">
          {t('premiumTitle')}
        </p>
        <span className="rounded-full border border-[#CEB47B] px-2.5 py-0.5 text-[10px] text-[#CEB47B]">
          {t('premiumBadge')}
        </span>
      </div>
      {payResult && (
        <p
          role="status"
          className={
            payResult === 'ok'
              ? 'rounded-lg border border-[#CEB47B]/40 px-3 py-2 text-[12px] text-[#CEB47B]'
              : 'rounded-lg border border-red-300/30 px-3 py-2 text-[12px] text-red-300'
          }
        >
          {t(`pay.${payResult}`)}
        </p>
      )}
      <p className="text-[12px] leading-6 text-[#AAB6CD]">
        {t('premiumDesc')}
      </p>
      <ul className="space-y-1.5">
        {([0, 1, 2, 3] as const).map((i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-[12px] text-[#E8D9B8]"
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
        className="h-11 w-full bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180] gap-2"
      >
        {icon('premium')}
        {!exporter.premiumUnlocked && PREMIUM_PRICE_TOMAN
          ? t('premiumPayBtn', { price: formatToman(PREMIUM_PRICE_TOMAN) })
          : t('premiumDownloadBtn')}
      </Button>
      <p className="text-center text-[11px] leading-5 text-[#AAB6CD]">
        {t('premiumNote')}
      </p>
    </div>
  );

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

      {/* When the layout is premium the free card is locked, so the way forward comes first. */}
      {locked ? (
        <>
          {premiumCard}
          {digitalCard}
        </>
      ) : (
        <>
          {digitalCard}
          {premiumCard}
        </>
      )}

      {/* No account note */}
      <p className="flex items-center justify-start gap-1.5 text-xs text-[#AAB6CD]">
        <ShieldCheck className="size-3.5 shrink-0" />
        {t('noAccount')}
      </p>
      {exporter.notice && (
        <p
          role="status"
          className={
            exporter.notice !== 'copied'
              ? 'text-start text-xs text-red-300'
              : 'text-start text-xs text-[#CEB47B]'
          }
        >
          {exporter.notice === 'error'
            ? t('exportError')
            : exporter.notice === 'payment'
              ? t('pay.unavailable')
              : t('shareCopied')}
        </p>
      )}
    </div>
  );
}

/** Full-width tips row below preview + download columns (step 3). */
export function Step3ReceiveInfo() {
  const t = useTranslations('CreatePage.step3');

  return (
    <div className="space-y-4 pt-10">
      <p className="text-xl font-semibold ">{t('infoTitle')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {([0, 1, 2] as const).map((i) => (
          <div key={i} className="rounded-xl bg-[#142039] p-6 space-y-1.5">
            <p className="text-sm font-semibold text-[#E8D9B8]">
              {t(`infoItems.${i}.title`)}
            </p>
            <p className="text-xs leading-5 text-[#AAB6CD]">
              {t(`infoItems.${i}.body`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
