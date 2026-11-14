'use client';

import { useTranslations } from 'next-intl';
import { POSTER_FRAMES, frameSvg, type PosterFrame } from '../lib/frames';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../lib/poster-svg';
import { POSTER_THEMES, type PosterStyle } from '../lib/themes';
import { ChoiceGroup } from './ChoiceGroup';

/** The part of the poster shown in each thumbnail: the top-left corner, where frames differ most. */
const CROP = 170;

/** A corner of the poster in the chosen colours, with this frame drawn on it. */
function FrameThumb({ frame, colors }: { frame: PosterFrame; colors: ThumbColors }) {
  const { paper } = colors;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${CROP} ${CROP}`}
      className="size-12 shrink-0 rounded-md"
      // the same fragment the poster uses, with heavier lines so they read at thumbnail size
      dangerouslySetInnerHTML={{
        __html:
          `<rect width="${CROP}" height="${CROP}" fill="${paper}"/>` +
          frameSvg(frame, colors, POSTER_WIDTH, POSTER_HEIGHT, { strokeScale: 2.5 }),
      }}
    />
  );
}

type ThumbColors = { paper: string; frame: string; frameSoft: string };

type Props = {
  value: PosterFrame;
  onChange: (frame: PosterFrame) => void;
  /** Colours the thumbnails are drawn in, so each one shows the border as it will look. */
  style?: PosterStyle;
  /** The same, for posters that are not a sky style (the treasure map). */
  colors?: ThumbColors;
};

/** Which border goes around the poster. */
export function FramePicker({ value, onChange, style = 'gold', colors }: Props) {
  const t = useTranslations('CreatePage.step2');
  const theme = POSTER_THEMES[style];
  const thumb: ThumbColors = colors ?? {
    paper: theme.paperStops[theme.paperStops.length - 1]![1],
    frame: theme.frame,
    frameSoft: theme.frameSoft,
  };

  return (
    <ChoiceGroup
      name="poster-frame"
      legend={t('borderLabel')}
      value={value}
      onChange={onChange}
      className="grid grid-cols-4 gap-2"
      choiceClassName="p-2"
      choices={POSTER_FRAMES.map((frame) => ({
        value: frame,
        // what each one is, for a pointer that hovers
        title: t(`borders.${frame}.hint`),
        content: (
          <span className="flex flex-col items-center gap-1.5">
            {frame === 'none' ? (
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-white/25 text-white/40"
              >
                —
              </span>
            ) : (
              <FrameThumb frame={frame} colors={thumb} />
            )}
            <span className="text-center text-[11px] leading-4 text-white/60 group-has-[:checked]/choice:font-medium group-has-[:checked]/choice:text-white">
              {t(`borders.${frame}.label`)}
            </span>
          </span>
        ),
      }))}
    />
  );
}
