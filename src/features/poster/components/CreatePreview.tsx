'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Info, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PosterPreview, type PosterData } from './PosterPreview';
import { Dims } from './FormatPicker';
import { FormatPreviewFrame } from './FormatPreviewFrame';
import { toPersianDigits } from '../lib/digits';
import {
  getExportFormat,
  formatSpec,
  type ExportFormatId,
} from '../lib/export-formats';
import type { SkySnapshot } from '@/features/sky/lib/types';
import type { PosterExport } from '../hooks/use-poster-export';
import type { MomentData } from './CreateStepper';

type Props = {
  step: number;
  poster: Partial<PosterData>;
  /** Real sky for the chosen moment; null falls back to the static illustration. */
  sky: SkySnapshot | null;
  moment: MomentData;
  onBack: () => void;
  exporter: PosterExport;
  /** The file chosen in step 3; the preview shows the poster on that file's page. */
  format: ExportFormatId;
  /** Copies a link that shows this poster to whoever opens it (step 3). */
  onCopyGift: () => void;
  giftStatus: 'copied' | 'error' | null;
  /** Opens Telegram or WhatsApp with the gift link ready to send. */
  onShareGift?: (app: 'telegram' | 'whatsapp') => void;
};

/** Cream preview card + the per-step content shown beneath it. */
export function CreatePreview({
  step,
  poster,
  sky,
  moment,
  onBack,
  exporter,
  format,
  onCopyGift,
  giftStatus,
  onShareGift,
}: Props) {
  const t = useTranslations('CreatePage');
  const tFormats = useTranslations('CreatePage.step3.formats');
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

  // Only step 3 chooses a file, so only there does the preview show its page.
  const shown: ExportFormatId = step === 3 ? format : 'poster';
  const shownFormat = getExportFormat(shown);
  const shownSpec = formatSpec(shownFormat);

  return (
    <aside className="flex w-full min-w-0 flex-col gap-5 md:sticky md:top-8">
      <div className="rounded-xl m-auto w-full bg-[#F4EFE6] p-6 text-[#1c2540]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('preview.title')}</span>
          <span className="text-[#1c2540]/70">{t('preview.label')}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <FormatPreviewFrame format={shown} style={poster.style ?? 'gold'}>
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
          </FormatPreviewFrame>
        </div>

        {step === 3 && shown !== 'poster' && (
          <p className="mt-4 text-center text-xs text-[#1c2540]/70">
            {t('preview.formatCaption', { label: tFormats(`items.${shown}.label`) })}{' '}
            <Dims
              w={shownSpec.page.w}
              h={shownSpec.page.h}
              cm={shownSpec.kind === 'pdf'}
            />{' '}
            {shownSpec.kind === 'pdf' ? tFormats('units.cm') : tFormats('units.px')}
          </p>
        )}

        <p className="mt-6 text-center text-sm font-medium">{caption}</p>
        <p className="mt-3 text-center text-xs text-[#1c2540]/70">
          {tPoster('disclaimer')}
        </p>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-[#33415B] p-5">
          <p className="text-sm font-semibold text-[#E8D9B8]">
            {t('infoCard.title')}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#AAB6CD]">
            {t('infoCard.body')}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#33415B] p-5">
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
              className="cursor-pointer p-7! gap-2 rounded-xl border-[#33415B] bg-transparent text-sm font-bold text-[#E8D9B8] hover:text-[#E8D9B8] hover:bg-white/5"
            >
              <ArrowRight className="size-4" />
              {tReceive('ctaBack')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exporter.share}
              disabled={exporter.freeLocked || exporter.busy !== null}
              title={exporter.freeLocked ? tReceive('freeLocked.shareHint') : undefined}
              className="cursor-pointer p-7! gap-2 rounded-xl border-[#33415B] bg-transparent text-sm font-bold text-[#E8D9B8] hover:text-[#E8D9B8] hover:bg-white/5"
            >
              {exporter.busy === 'share'
                ? tReceive('preparing')
                : tReceive('ctaShare')}
              <Share2 className="size-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onCopyGift}
            className="cursor-pointer p-7! gap-2 rounded-xl border-[#CEB47B]/50 bg-transparent text-sm font-bold text-[#E8D9B8] hover:bg-[#CEB47B]/10 hover:text-[#CEB47B]"
          >
            {giftStatus === 'copied'
              ? tReceive('giftCopied')
              : giftStatus === 'error'
                ? tReceive('giftError')
                : tReceive('giftLink')}
            <Link2 className="size-4" />
          </Button>
          {onShareGift && (
            <div className="grid grid-cols-2 gap-3">
              {(['telegram', 'whatsapp'] as const).map((app) => (
                <Button
                  key={app}
                  type="button"
                  variant="outline"
                  onClick={() => onShareGift(app)}
                  className="h-11 cursor-pointer rounded-xl border-[#33415B] bg-transparent text-xs font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
                >
                  {tReceive(app === 'telegram' ? 'giftShareTelegram' : 'giftShareWhatsapp')}
                </Button>
              ))}
            </div>
          )}
          <p className="text-xs leading-6 text-[#AAB6CD]">{tReceive('giftNote')}</p>
          <p className="text-xs pb-8 leading-6 text-[#AAB6CD]">
            {t('preview.shareNote')}
          </p>
        </>
      )}
    </aside>
  );
}
