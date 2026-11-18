'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  Crown,
  Download,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { PaymentDialog } from '@/features/payments/components/PaymentDialog';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { DonateCard } from '@/features/support/components/DonateCard';
import { formatToman } from '../lib/digits';
import type { ExportFormatId } from '../lib/export-formats';
import { FormatPicker } from './FormatPicker';
import { Button } from '@/components/ui/button';
import { StepHeader } from '@/components/form/FormShell';
import type { PosterExport } from '../hooks/use-poster-export';
import type { MomentData, PersonalizeData } from './CreateStepper';

type Props = {
  personal: Pick<PersonalizeData, 'names'>;
  moment: MomentData;
  exporter: PosterExport;
  /** The file that will be downloaded; the preview beside the form shows the same one. */
  format: ExportFormatId;
  onFormatChange: (id: ExportFormatId) => void;
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
  format,
  onFormatChange,
  onUseFreeLayout,
}: Props) {
  const t = useTranslations('CreatePage.step3');
  const tMoment = useTranslations('CreatePage.step1');
  const tSupport = useTranslations('Support');

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
      className={`space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-[#18253f]/90 to-[#111b33]/90 p-5 shadow-xl shadow-black/20 md:p-6 ${locked ? 'opacity-90' : ''}`}
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
            <Crown
              aria-hidden
              className="mt-1 size-3.5 shrink-0 text-[#CEB47B]"
            />
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
          className="h-12 w-full gap-2 rounded-xl bg-[#CEB47B] text-base font-bold text-[#0c142b] shadow-lg shadow-[#CEB47B]/20 hover:bg-[#e0c180]"
        >
          {icon('png')}
          {t('downloadPng')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={exporter.downloadSvg}
          disabled={locked || exporter.busy !== null}
          className="h-11 w-full gap-2 rounded-xl border-white/10 bg-transparent text-sm text-white/70 hover:bg-white/5"
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
    <div className="relative space-y-5 overflow-hidden rounded-3xl border border-[#CEB47B]/70 bg-gradient-to-b from-[#1d2c4a] to-[#111b33] p-5 shadow-[0_20px_60px_-20px_rgba(206,180,123,0.35)] md:p-6">
      <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-[#CEB47B]/15 blur-3xl" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-bold text-[#CEB47B]">
          {t('premiumTitle')}
        </p>
        <span className="rounded-full border border-[#CEB47B] px-2.5 py-0.5 text-[10px] text-[#CEB47B]">
          {t('premiumBadge')}
        </span>
      </div>
      {/* where the card-to-card payment stands, and the window to pay in */}
      <PaymentDialog />
      <p className="text-[12px] leading-6 text-[#AAB6CD]">{t('premiumDesc')}</p>
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

      <FormatPicker value={format} onChange={onFormatChange} />

      <Button
        type="button"
        onClick={() => exporter.downloadPremium(format)}
        disabled={exporter.busy !== null}
        className="h-12 w-full gap-2 rounded-xl bg-[#CEB47B] text-base font-bold text-[#0c142b] shadow-lg shadow-[#CEB47B]/20 hover:bg-[#e0c180]"
      >
        {icon('premium')}
        {!exporter.premiumUnlocked && PREMIUM_PRICE_TOMAN
          ? t('premiumPayBtn', { price: formatToman(PREMIUM_PRICE_TOMAN) })
          : t('premiumDownloadBtn')}
      </Button>
      {/* The gateway error belongs next to the button that caused it */}
      {exporter.notice === 'payment' && (
        <p
          role="alert"
          className="rounded-lg border border-red-300/30 px-3 py-2 text-[12px] leading-6 text-red-300"
        >
          {t('pay.unavailable')}
        </p>
      )}
      <p className="text-center text-[11px] leading-5 text-[#AAB6CD]">
        {t('premiumNote')}
      </p>
    </div>
  );

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <StepHeader title={t('title')} description={description} />
        <p className="text-[12px] leading-6 text-white/60">{t('digitalOnlyNote')}</p>
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
      <p className="text-xs leading-6 text-[#AAB6CD]">
        {tSupport('help')}{' '}
        <Link
          href="/contact"
          className="text-[#CEB47B] underline-offset-4 hover:underline"
        >
          {tSupport('contact.title')}
        </Link>
      </p>
      {/* renders nothing until a donation card is configured */}
      <DonateCard variant="compact" />
      {exporter.notice && exporter.notice !== 'payment' && (
        <p
          role="status"
          className={
            exporter.notice !== 'copied'
              ? 'text-start text-xs text-red-300'
              : 'text-start text-xs text-[#CEB47B]'
          }
        >
          {exporter.notice === 'error' ? t('exportError') : t('shareCopied')}
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
          <div key={i} className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
