'use client';

import { useTranslations } from 'next-intl';
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

/** Choose the picture drawn for a moment on the illustrated road: a watercolour one, or a simple drawn one. */
export function MapIconPicker({ value, onChange }: Props) {
  const t = useTranslations('MapPage');
  // an untouched moment shows the watercolour set first
  const kind = value.art || !value.icon ? 'art' : 'drawn';
  const kinds = ['art', 'drawn'] as const;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-[#AAB6CD]">{t('iconLabel')}</span>
        <div role="tablist" aria-label={t('iconLabel')} className="flex gap-1">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => (k === 'art' ? onChange({ art: value.art ?? MAP_ART[0], icon: value.icon }) : onChange({ icon: value.icon ?? 'star' }))}
              className={`rounded-full px-2.5 py-1 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${kind === k ? 'bg-[#CEB47B] text-[#0c142b]' : 'text-[#AAB6CD] hover:bg-white/5'}`}
            >
              {t(`pictureKind.${k}`)}
            </button>
          ))}
        </div>
      </div>
      {kind === 'art' ? (
        <div role="radiogroup" aria-label={t('pictureKind.art')} className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {MAP_ART.map((art) => (
            <button
              key={art}
              type="button"
              role="radio"
              aria-checked={value.art === art}
              aria-label={t(`art.${art}`)}
              title={t(`art.${art}`)}
              onClick={() => onChange({ art, icon: value.icon })}
              className={tile(value.art === art)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnails of a fixed set */}
              <img src={artSrc(art)} alt="" loading="lazy" width={64} height={64} className="size-full object-contain" />
            </button>
          ))}
        </div>
      ) : (
        <div role="radiogroup" aria-label={t('pictureKind.drawn')} className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {MAP_ICONS.map((icon) => {
            const on = (value.icon ?? 'star') === icon;
            return (
              <button
                key={icon}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={t(`icons.${icon}`)}
                title={t(`icons.${icon}`)}
                onClick={() => onChange({ icon })}
                className={tile(on)}
              >
                <svg viewBox="0 0 100 100" className="size-full" aria-hidden dangerouslySetInnerHTML={{ __html: iconMarkup(icon, THUMB) }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
