'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Crown, Download, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentDialog } from '@/features/payments/components/PaymentDialog';
import { FormatPicker } from '@/features/poster/components/FormatPicker';
import { formatToman, toPersianDigits } from '@/features/poster/lib/digits';
import type { ExportFormatId } from '@/features/poster/lib/export-formats';
import type { MapExport } from '../hooks/use-map-export';
import { MAX_MILESTONES, MIN_MILESTONES, maxMilestones } from '../lib/map-svg';
import type { MapProblem } from '../lib/problems';
import type { TreasureMapValues } from '../lib/schemas';
import { StepHeader, ctaPrimary } from '@/components/form/FormShell';

type Props = {
  exporter: MapExport;
  format: ExportFormatId;
  onFormatChange: (id: ExportFormatId) => void;
  valid: boolean;
  /** What is in the way of making the map, if anything. */
  problems: MapProblem[];
  data: TreasureMapValues;
  /** Go back to a step to change something. */
  onEdit: (step: number) => void;
  /** Width ÷ height of the poster. */
  aspect: number;
};

/** Step 3: pick the file and pay for it. The map has no free download. */
export function MapStep3({ exporter, format, onFormatChange, valid, problems, data, onEdit, aspect }: Props) {
  const t = useTranslations('MapPage');
  const tSupport = useTranslations('Support');
  const price = exporter.premiumUnlocked ? null : exporter.premiumPrice;

  return (
    <div className="space-y-6">
      <StepHeader title={t('step3.title')} description={t('step3.description')} />

      {/* what is about to be made, with a way back to change it */}
      <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-3xl border border-white/10 bg-gradient-to-b from-[#18253f]/90 to-[#111b33]/90 p-4 text-center">
        {(
          [
            [t('summary.layout'), t(`layout.${data.layout}.label`), 1],
            [t('summary.moments'), toPersianDigits(String(data.milestones.length)), 1],
            [t('summary.look'), t(`theme.${data.theme}`), 2],
          ] as const
        ).map(([label, value, step]) => (
          <div key={label} className="min-w-0 space-y-1">
            <dt className="text-[11px] text-[#AAB6CD]">{label}</dt>
            <dd className="truncate text-sm font-medium text-white">{value}</dd>
            <button
              type="button"
              onClick={() => onEdit(step)}
              className="text-[11px] text-[#CEB47B] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]"
            >
              {t('summary.edit')}
            </button>
          </div>
        ))}
      </dl>

      <div className="relative space-y-5 overflow-hidden rounded-3xl border border-[#CEB47B]/70 bg-gradient-to-b from-[#1d2c4a] to-[#111b33] p-5 shadow-[0_20px_60px_-20px_rgba(206,180,123,0.35)] md:p-6">
        <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-[#CEB47B]/15 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-base font-bold text-[#CEB47B]">
            <Crown aria-hidden className="size-4" />
            {t('premium.title')}
          </p>
          <span className="rounded-full border border-[#CEB47B] px-2.5 py-0.5 text-[10px] text-[#CEB47B]">
            {t('premium.badge')}
          </span>
        </div>
        {/* where the card-to-card payment stands, and the window to pay in */}
        <PaymentDialog product={exporter.product} />
        <p className="text-[12px] leading-6 text-[#AAB6CD]">{t('premium.desc')}</p>
        <ul className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-[#E8D9B8]">
              <Check className="size-3.5 shrink-0 text-[#CEB47B]" />
              {t(`premium.features.${i}`)}
            </li>
          ))}
        </ul>

        <FormatPicker value={format} onChange={onFormatChange} aspect={aspect} />

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={() => exporter.downloadPremium(format)}
            disabled={!valid || exporter.busy !== null}
            className={`${ctaPrimary} w-full`}
          >
            {exporter.busy === 'premium' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : exporter.premiumUnlocked ? (
              <Download className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
            {price ? t('premium.payBtn', { price: formatToman(price) }) : t('premium.downloadBtn')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={exporter.downloadSvg}
            disabled={!valid || exporter.busy !== null}
            className="h-11 w-full gap-2 rounded-xl border-white/10 bg-transparent text-sm text-white/80 hover:bg-white/5"
          >
            {exporter.busy === 'svg' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4 opacity-70" />}
            {t('premium.downloadSvg')}
          </Button>
        </div>
        {!valid && (
          <div role="status" className="space-y-1 text-[12px] leading-6 text-[#E8D9B8]">
            {problems.length > 0 ? (
              problems.map((problem) => (
                <p key={problem}>
                  {t(`problems.${problem}`, {
                    min: toPersianDigits(String(MIN_MILESTONES)),
                    max: toPersianDigits(String(maxMilestones(data.layout) || MAX_MILESTONES)),
                  })}
                </p>
              ))
            ) : (
              <p>{t('premium.incomplete')}</p>
            )}
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="text-[#CEB47B] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]"
            >
              {t('summary.fix')}
            </button>
          </div>
        )}
        {exporter.notice && (
          <p role="alert" className="rounded-lg border border-red-300/30 px-3 py-2 text-[12px] leading-6 text-red-300">
            {exporter.notice === 'payment' ? t('premium.paymentUnavailable') : t('premium.error')}
          </p>
        )}
        <p className="text-center text-[11px] leading-5 text-[#AAB6CD]">{t('premium.note')}</p>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[#AAB6CD]">
        <ShieldCheck className="size-3.5 shrink-0" />
        {t('step3.noAccount')}
      </p>
      <p className="text-xs leading-6 text-[#AAB6CD]">
        {tSupport('help')}{' '}
        <Link href="/contact" className="text-[#CEB47B] underline-offset-4 hover:underline">
          {tSupport('contact.title')}
        </Link>
      </p>
    </div>
  );
}
