'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ART_GROUPS, MAP_ART, artSrc, type MapArt } from '../lib/art';
import { ICON_GROUPS, iconMarkup, type MapIcon } from '../lib/illustrations';

// the drawn pictures are drawn in the paper theme's colours, on a paper-coloured tile
const THUMB = { ink: '#2A2733', card: '#FBF8F1', accent: '#B4513C', land: '#EFE6D5', water: '#C9DADD', park: '#D8E1CC' };

export type PictureChoice = { icon?: MapIcon; art?: MapArt };

type Props = {
  value: PictureChoice;
  onChange: (choice: PictureChoice) => void;
};

const tile = (on: boolean) =>
  `aspect-square rounded-lg bg-[#F6F0E4] p-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${on ? 'ring-2 ring-[#CEB47B]' : 'opacity-80 hover:opacity-100'}`;

export function Thumb({ value }: { value: PictureChoice }) {
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
  const [picked, setPicked] = useState<string | null>(null);
  // an untouched moment shows the watercolour set first
  const kind = value.art || !value.icon ? 'art' : 'drawn';
  const kinds = ['art', 'drawn'] as const;
  const name = value.art ? t(`art.${value.art}`) : t(`icons.${value.icon ?? 'star'}`);
  const pick = (choice: PictureChoice) => {
    onChange(choice);
    setOpen(false);
  };

  // both sets are shown one group at a time, so no one has to scroll through ninety-nine pictures
  const groups: ReadonlyArray<{ id: string; items: readonly string[] }> =
    kind === 'art'
      ? ART_GROUPS.map((g) => ({ id: g.id, items: g.arts }))
      : ICON_GROUPS.map((g) => ({ id: g.id, items: g.icons }));
  const chosen = kind === 'art' ? value.art : (value.icon ?? 'star');
  const chosenGroup = groups.find((g) => chosen && g.items.includes(chosen))?.id;
  const activeId = groups.find((g) => g.id === picked)?.id ?? chosenGroup ?? groups[0]?.id;
  const active = groups.find((g) => g.id === activeId) ?? groups[0];

  return (
    <div className="space-y-1.5">
      <span className="text-[12px] text-[#AAB6CD]">{t('iconLabel')}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0a1226]/70 p-2 text-start transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B]"
      >
        <span className="size-14 shrink-0 rounded-md bg-[#F6F0E4] p-1">
          <Thumb value={value} />
        </span>
        <span className="flex-1 text-sm text-white/90">{name}</span>
        <span className="text-[12px] text-[#CEB47B]">{t('pictureChange')}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden border border-[#33415B] bg-[#142039] p-0 text-white sm:max-w-3xl">
          <div className="space-y-3 px-5 pt-5">
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
                  onClick={() => {
                    setPicked(null);
                    onChange(k === 'art' ? { art: value.art ?? MAP_ART[0] } : { icon: value.icon ?? 'star' });
                  }}
                  className={`rounded-full px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] ${kind === k ? 'bg-[#CEB47B] text-[#0c142b]' : 'text-[#AAB6CD] hover:bg-white/5'}`}
                >
                  {t(`pictureKind.${k}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex min-h-0 flex-1 flex-col border-t border-white/10 md:flex-row">
            {/* the groups: a swipe row on a phone, a list down the side with a mouse */}
            <nav
              aria-label={t('iconLabel')}
              className="flex shrink-0 gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:w-48 md:flex-col md:gap-1 md:overflow-y-auto md:overflow-x-visible md:border-e md:border-white/10 md:px-3 md:[scrollbar-color:#33415B_transparent] md:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden"
            >
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={g.id === active?.id}
                  onClick={() => setPicked(g.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-start text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CEB47B] md:rounded-xl md:py-2',
                    g.id === active?.id ? 'bg-[#CEB47B] font-semibold text-[#0c142b]' : 'text-[#AAB6CD] hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span className="flex-1">{t(`artGroup.${g.id}`)}</span>
                  {g.id === chosenGroup && g.id !== active?.id && (
                    <span aria-hidden className="size-1.5 rounded-full bg-[#CEB47B]" />
                  )}
                </button>
              ))}
            </nav>

            <div
              role="radiogroup"
              aria-label={active ? t(`artGroup.${active.id}`) : t('iconLabel')}
              className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-color:#33415B_transparent] [scrollbar-width:thin]"
            >
              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                {active?.items.map((item) => {
                  const on = chosen === item;
                  const label = kind === 'art' ? t(`art.${item}`) : t(`icons.${item}`);
                  return (
                    <button
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={label}
                      title={label}
                      onClick={() => pick(kind === 'art' ? { art: item as MapArt } : { icon: item as MapIcon })}
                      className={tile(on)}
                    >
                      {kind === 'art' ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnails of a fixed set
                        <img src={artSrc(item as MapArt)} alt="" width={96} height={96} className="size-full object-contain" />
                      ) : (
                        <svg viewBox="0 0 100 100" className="size-full" aria-hidden dangerouslySetInnerHTML={{ __html: iconMarkup(item as MapIcon, THUMB) }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
