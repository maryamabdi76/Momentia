'use client';

import { useTranslations } from 'next-intl';
import { iconMarkup, MAP_ICONS, type MapIcon } from '../lib/illustrations';

// the pictures are drawn in the paper theme's colours, on a paper-coloured tile
const THUMB = { ink: '#2A2733', card: '#FBF8F1', accent: '#B4513C', land: '#EFE6D5', water: '#C9DADD', park: '#D8E1CC' };

type Props = {
  value: MapIcon | undefined;
  onChange: (icon: MapIcon) => void;
};

/** Choose the picture drawn for a moment on the illustrated road. */
export function MapIconPicker({ value, onChange }: Props) {
  const t = useTranslations('MapPage');
  return (
    <div className="space-y-1.5">
      <span className="text-[12px] text-[#AAB6CD]">{t('iconLabel')}</span>
      <div role="radiogroup" aria-label={t('iconLabel')} className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {MAP_ICONS.map((icon) => {
          const on = (value ?? 'star') === icon;
          return (
            <button
              key={icon}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`icons.${icon}`)}
              title={t(`icons.${icon}`)}
              onClick={() => onChange(icon)}
              className={`aspect-square rounded-lg bg-[#F6F0E4] p-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${on ? 'ring-2 ring-[#CEB47B]' : 'opacity-80 hover:opacity-100'}`}
            >
              <svg viewBox="0 0 100 100" className="size-full" aria-hidden dangerouslySetInnerHTML={{ __html: iconMarkup(icon, THUMB) }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
