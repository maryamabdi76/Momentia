'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mapAspect, type TreasureMapData, type TreasureMapLabels } from '../lib/map-svg';
import { MapPoster } from './MapPoster';

/** On a phone the preview sits far below the form, so it opens in a window from a button at the top. */
export function MobilePreview({ data, labels }: { data: TreasureMapData; labels: TreasureMapLabels }) {
  const t = useTranslations('MapPage');
  const [open, setOpen] = useState(false);
  const aspect = mapAspect(data.layout);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 w-full gap-2 border-[#33415B] bg-transparent text-sm text-[#E8D9B8] hover:bg-white/5"
      >
        <Eye className="size-4" aria-hidden />
        {t('mobilePreview')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto border border-[#33415B] bg-[#142039] p-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#CEB47B]">{t('preview.title')}</DialogTitle>
            <DialogDescription className="text-[#AAB6CD]">{t('preview.note')}</DialogDescription>
          </DialogHeader>
          {/* as large as fits both the width and the height of the screen */}
          <div className="mx-auto w-full" style={{ maxWidth: `calc(${aspect} * (100dvh - 14rem))` }}>
            <MapPoster data={data} labels={labels} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
