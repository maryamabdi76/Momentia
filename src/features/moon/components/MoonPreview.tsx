'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Info, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/features/poster/lib/digits';
import { formatSpec, getExportFormat, type ExportFormatId } from '@/features/poster/lib/export-formats';
import type { MomentData } from '@/features/poster/components/CreateStepper';
import { Dims } from '@/features/poster/components/FormatPicker';
import { FormatPreviewFrame } from '@/features/poster/components/FormatPreviewFrame';
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
  /** The file chosen in step 3; the preview shows the poster on that file's page. */
  format: ExportFormatId;
};

/** Cream preview card + the per-step content shown beneath it. */
export function MoonPreview({ step, poster, sky, moment, onBack, exporter, format }: Props) {
  const t = useTranslations('MoonPage');
  const tPreview = useTranslations('CreatePage');
  const tReceive = useTranslations('CreatePage.step3');
  const tFormats = useTranslations('CreatePage.step3.formats');
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

  // Only step 3 chooses a file, so only there does the preview show its page.
  const shown: ExportFormatId = step === 3 ? format : 'poster';
  const shownSpec = formatSpec(getExportFormat(shown));

  return (
    <aside className="flex w-full flex-col gap-5 md:sticky md:top-8">
      <div className="m-auto w-full rounded-xl bg-[#F4EFE6] p-6 text-[#1c2540]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('preview.title')}</span>
          <span className="text-[#1c2540]/70">{tPreview('preview.label')}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <FormatPreviewFrame format={shown} style={poster.style}>
            {facts ? (
              <MoonPoster
                data={poster}
                facts={facts}
                labels={labels}
                watermark
                // the plain poster carries its own shadow; on a page it sits flat
                className={shown === 'poster' ? 'shadow-xl' : undefined}
              />
            ) : (
              <div className="aspect-[2/3] w-full animate-pulse bg-[#1c2540]/10" />
            )}
          </FormatPreviewFrame>
        </div>

        {step === 3 && shown !== 'poster' && (
          <p className="mt-4 text-center text-xs text-[#1c2540]/70">
            {tPreview('preview.formatCaption', { label: tFormats(`items.${shown}.label`) })}{' '}
            <Dims w={shownSpec.page.w} h={shownSpec.page.h} cm={shownSpec.kind === 'pdf'} />{' '}
            {shownSpec.kind === 'pdf' ? tFormats('units.cm') : tFormats('units.px')}
          </p>
        )}

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
