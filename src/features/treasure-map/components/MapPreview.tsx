'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dims } from '@/features/poster/components/FormatPicker';
import { FormatPreviewFrame } from '@/features/poster/components/FormatPreviewFrame';
import { formatSpec, getExportFormat, type ExportFormatId } from '@/features/poster/lib/export-formats';
import { mapAspect, mapPaperColor, type TreasureMapData, type TreasureMapLabels } from '../lib/map-svg';
import { MapPoster } from './MapPoster';

type Props = {
  step: number;
  data: TreasureMapData;
  labels: TreasureMapLabels;
  /** The file chosen in step 3; the preview shows the map on that file's page. */
  format: ExportFormatId;
  onBack: () => void;
};

/** Cream preview card, as in the moon and sky creators. */
export function MapPreview({ step, data, labels, format, onBack }: Props) {
  const t = useTranslations('MapPage');
  const tPreview = useTranslations('CreatePage');
  const tReceive = useTranslations('CreatePage.step3');
  const tFormats = useTranslations('CreatePage.step3.formats');

  const shown: ExportFormatId = step === 3 ? format : 'poster';
  const aspect = mapAspect(data.layout);
  const spec = formatSpec(getExportFormat(shown), aspect);

  return (
    <aside className="flex w-full min-w-0 flex-col gap-5 md:sticky md:top-8">
      <div className="m-auto w-full rounded-xl bg-[#F4EFE6] p-6 text-[#1c2540]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('preview.title')}</span>
          <span className="text-[#1c2540]/70">{tPreview('preview.label')}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <FormatPreviewFrame format={shown} style="gold" mat={mapPaperColor(data.theme)} aspect={aspect}>
            <MapPoster data={data} labels={labels} className={shown === 'poster' ? 'shadow-xl' : 'shadow-none'} />
          </FormatPreviewFrame>
        </div>

        {step === 3 && shown !== 'poster' && (
          <p className="mt-4 text-center text-xs text-[#1c2540]/70">
            {tPreview('preview.formatCaption', { label: tFormats(`items.${shown}.label`) })}{' '}
            <Dims w={spec.page.w} h={spec.page.h} cm={spec.kind === 'pdf'} />{' '}
            {spec.kind === 'pdf' ? tFormats('units.cm') : tFormats('units.px')}
          </p>
        )}
        <p className="mt-4 text-center text-xs text-[#1c2540]/70">{t('preview.note')}</p>
        <p className="mt-2 text-center text-[11px] text-[#1c2540]/55">{t('preview.credit')}</p>
      </div>

      {step === 3 && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="cursor-pointer gap-2 rounded-xl border-[#33415B] bg-transparent p-7! text-sm font-bold text-[#E8D9B8] hover:bg-white/5 hover:text-[#E8D9B8]"
        >
          <ArrowRight className="size-4" />
          {tReceive('ctaBack')}
        </Button>
      )}
    </aside>
  );
}
