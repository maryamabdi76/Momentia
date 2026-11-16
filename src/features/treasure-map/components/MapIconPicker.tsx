'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MAP_ART, artSrc, type MapArt } from '../lib/art';
import { iconMarkup, MAP_ICONS, type MapIcon } from '../lib/illustrations';

// the drawn pictures are drawn in the paper theme's colours, on a paper-coloured tile
const THUMB = { ink: '#2A2733', card: '#FBF8F1', accent: '#B4513C', land: '#EFE6D5', water: '#C9DADD', park: '#D8E1CC' };

export type PictureChoice = { icon?: MapIcon; art?: MapArt };

type Props = {
  value: PictureChoice;
  onChange: (choice: PictureChoice) => void;
};

const tile = (on: boolean) =>
  `aspect-square rounded-lg bg-[#F6F0E4] p-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${on ? 'ring-2 ring-[#CEB47B]' : 'opacity-80 hover:opacity-100'}`;

function Thumb({ value }: { value: PictureChoice }) {
  return value.art ? (
    // eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnails of a fixed set
    <img src={artSrc(value.art)} alt="" width={64} height={64} className="size-full object-contain" />
  ) : (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden dangerouslySetInnerHTML={{ __html: iconMarkup(value.icon ?? 'star', THUMB) }} />
  );
}

/**
 * The picture drawn for a moment on the illustrated road. The moment shows only the one chosen,
 * as a button; the full sets (watercolour, or simple drawings) open in a window.
 */
export function MapIconPicker({ value, onChange }: Props) {
  const t = useTranslations('MapPage');
  const [open, setOpen] = useState(false);
  // an untouched moment shows the watercolour set first
  const kind = value.art || !value.icon ? 'art' : 'drawn';
  const kinds = ['art', 'drawn'] as const;
  const name = value.art ? t(`art.${value.art}`) : t(`icons.${value.icon ?? 'star'}`);
  const pick = (choice: PictureChoice) => {
    onChange(choice);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <span className="text-[12px] text-[#AAB6CD]">{t('iconLabel')}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-[#33415B] bg-[#101a38] p-2 text-start transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]"
      >
        <span className="size-14 shrink-0 rounded-md bg-[#F6F0E4] p-1">
          <Thumb value={value} />
        </span>
        <span className="flex-1 text-sm text-white/90">{name}</span>
        <span className="text-[12px] text-[#CEB47B]">{t('pictureChange')}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto border border-[#33415B] bg-[#142039] p-5 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#CEB47B]">{t('iconLabel')}</DialogTitle>
            <DialogDescription className="text-[#AAB6CD]">{t('pictureHint')}</DialogDescription>
          </DialogHeader>
          <div role="tablist" aria-label={t('iconLabel')} className="flex gap-1">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => onChange(k === 'art' ? { art: value.art ?? MAP_ART[0] } : { icon: value.icon ?? 'star' })}
                className={`rounded-full px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${kind === k ? 'bg-[#CEB47B] text-[#0c142b]' : 'text-[#AAB6CD] hover:bg-white/5'}`}
              >
                {t(`pictureKind.${k}`)}
              </button>
            ))}
          </div>
          {kind === 'art' ? (
            <div role="radiogroup" aria-label={t('pictureKind.art')} className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MAP_ART.map((art) => (
                <button
                  key={art}
                  type="button"
                  role="radio"
                  aria-checked={value.art === art}
                  aria-label={t(`art.${art}`)}
                  title={t(`art.${art}`)}
                  onClick={() => pick({ art })}
                  className={tile(value.art === art)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnails of a fixed set */}
                  <img src={artSrc(art)} alt="" loading="lazy" width={64} height={64} className="size-full object-contain" />
                </button>
              ))}
            </div>
          ) : (
            <div role="radiogroup" aria-label={t('pictureKind.drawn')} className="grid grid-cols-5 gap-2 sm:grid-cols-7">
              {MAP_ICONS.map((icon) => {
                const on = !value.art && (value.icon ?? 'star') === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={t(`icons.${icon}`)}
                    title={t(`icons.${icon}`)}
                    onClick={() => pick({ icon })}
                    className={tile(on)}
                  >
                    <svg viewBox="0 0 100 100" className="size-full" aria-hidden dangerouslySetInnerHTML={{ __html: iconMarkup(icon, THUMB) }} />
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
