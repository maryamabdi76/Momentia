'use client';

import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { POSTER_FRAMES, frameSvg, type PosterFrame } from '../lib/frames';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../lib/poster-svg';
import { POSTER_THEMES, type PosterStyle } from '../lib/themes';

/** The part of the poster shown in each thumbnail: the top-left corner, where frames differ most. */
const CROP = 170;

/** A corner of the poster in the chosen colours, with this frame drawn on it. */
function FrameThumb({ frame, style }: { frame: PosterFrame; style: PosterStyle }) {
  const theme = POSTER_THEMES[style];
  const paper = theme.paperStops[theme.paperStops.length - 1]![1];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${CROP} ${CROP}`}
      className="size-16 shrink-0 rounded-md"
      // the same fragment the poster uses, with heavier lines so they read at thumbnail size
      dangerouslySetInnerHTML={{
        __html:
          `<rect width="${CROP}" height="${CROP}" fill="${paper}"/>` +
          frameSvg(frame, theme, POSTER_WIDTH, POSTER_HEIGHT, { strokeScale: 2 }),
      }}
    />
  );
}

type Props = {
  value: PosterFrame;
  onChange: (frame: PosterFrame) => void;
  /** Colours the thumbnails are drawn in, so each one shows the border as it will look. */
  style: PosterStyle;
};

/** Which border goes around the poster. */
export function FramePicker({ value, onChange, style }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#E8D9B8]">{t('borderLabel')}</p>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PosterFrame)}
        className="grid grid-cols-2 gap-3"
        aria-label={t('borderLabel')}
      >
        {POSTER_FRAMES.map((frame) => {
          const selected = value === frame;
          return (
            <Label
              key={frame}
              htmlFor={`frame-${frame}`}
              className={cn(
                'flex cursor-pointer flex-col items-stretch gap-3 rounded-xl border p-3.5 transition-colors',
                selected ? 'border-[#CEB47B]/70 bg-[#CEB47B]/8' : 'border-[#33415B]',
              )}
            >
              <span className="flex items-start justify-between gap-2">
                {frame === 'none' ? (
                  <span
                    aria-hidden
                    className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-white/25 text-[10px] text-white/40"
                  >
                    —
                  </span>
                ) : (
                  <FrameThumb frame={frame} style={style} />
                )}
                <RadioGroupItem
                  value={frame}
                  id={`frame-${frame}`}
                  className="border-white/20 data-checked:border-[#CEB47B] data-checked:bg-[#CEB47B] dark:data-checked:border-[#CEB47B] dark:data-checked:bg-[#CEB47B] [&_[data-slot=radio-group-indicator]_span]:bg-[#0c142b]"
                />
              </span>
              <span className="space-y-1">
                <span
                  className={cn(
                    'block text-sm',
                    selected ? 'font-medium text-white' : 'font-normal text-white/60',
                  )}
                >
                  {t(`borders.${frame}.label`)}
                </span>
                <span className="block text-[11px] font-normal leading-5 text-[#AAB6CD]">
                  {t(`borders.${frame}.hint`)}
                </span>
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
