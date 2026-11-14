'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Crown, Download, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentDialog } from '@/features/payments/components/PaymentDialog';
import { PREMIUM_PRICE_TOMAN } from '@/features/payments/lib/client';
import { FormatPicker } from '@/features/poster/components/FormatPicker';
import { formatToman } from '@/features/poster/lib/digits';
import type { ExportFormatId } from '@/features/poster/lib/export-formats';
import type { MapExport } from '../hooks/use-map-export';

type Props = {
  exporter: MapExport;
  format: ExportFormatId;
  onFormatChange: (id: ExportFormatId) => void;
  valid: boolean;
};

/** Step 3: pick the file and pay for it. The map has no free download. */
export function MapStep3({ exporter, format, onFormatChange, valid }: Props) {
  const t = useTranslations('MapPage');
  const tSupport = useTranslations('Support');
  const price = exporter.premiumUnlocked ? null : PREMIUM_PRICE_TOMAN;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-[#CEB47B]">{t('step3.stepLabel')}</p>
        <h1 className="text-3xl font-bold text-white">{t('step3.title')}</h1>
        <p className="text-sm leading-7 text-white/55">{t('step3.description')}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#CEB47B] bg-[#142039] p-5">
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
        <PaymentDialog />
        <p className="text-[12px] leading-6 text-[#AAB6CD]">{t('premium.desc')}</p>
        <ul className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-[#E8D9B8]">
              <Check className="size-3.5 shrink-0 text-[#CEB47B]" />
              {t(`premium.features.${i}`)}
            </li>
          ))}
        </ul>

        <FormatPicker value={format} onChange={onFormatChange} />

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={() => exporter.downloadPremium(format)}
            disabled={!valid || exporter.busy !== null}
            className="h-11 w-full gap-2 bg-[#CEB47B] text-sm font-bold text-[#0c142b] hover:bg-[#e0c180]"
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
            className="h-11 w-full gap-2 border-[#33415B] bg-transparent text-sm text-white/80 hover:bg-white/5"
          >
            {exporter.busy === 'svg' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4 opacity-70" />}
            {t('premium.downloadSvg')}
          </Button>
        </div>
        {!valid && <p className="text-[12px] leading-6 text-[#E8D9B8]">{t('premium.incomplete')}</p>}
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
