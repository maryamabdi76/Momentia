'use client';

import { useTranslations } from 'next-intl';
import { POSTER_STYLES, POSTER_THEMES, paperCss, type PosterStyle } from '../lib/themes';
import { ChoiceGroup } from './ChoiceGroup';

type Props = {
  value: PosterStyle;
  onChange: (style: PosterStyle) => void;
};

/** A tiny poster in this style's own paper, frame, ink and glow, so the choice is the real thing. */
function MiniPoster({ style }: { style: PosterStyle }) {
  const theme = POSTER_THEMES[style];
  // a few stars joined by thin lines, like a constellation
  const stars: Array<[number, number]> = [
    [20, 33],
    [28, 27],
    [37, 31],
    [42, 40],
    [33, 46],
    [24, 43],
  ];
  return (
    <span
      aria-hidden
      className="block aspect-[3/4] w-full overflow-hidden rounded-md shadow-md ring-1 ring-black/25"
      style={{ background: paperCss(theme) }}
    >
      <svg viewBox="0 0 60 80" className="block size-full">
        <rect x="3" y="3" width="54" height="74" rx="1.5" fill="none" stroke={theme.frame} strokeWidth="0.8" />
        {/* the title */}
        <rect x="19" y="9" width="22" height="2" rx="1" fill={theme.ink} opacity="0.9" />
        <rect x="24" y="13.5" width="12" height="1.2" rx="0.6" fill={theme.muted} />
        {/* the sky: a true circle with a soft glow */}
        {theme.glow && <circle cx="30" cy="37" r="22" fill={theme.glow} opacity="0.1" />}
        <circle cx="30" cy="37" r="19" fill="none" stroke={theme.frameSoft} strokeWidth="0.7" />
        <polyline
          points={stars.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke={theme.accent}
          strokeWidth="0.45"
          opacity="0.75"
        />
        {stars.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" fill={theme.accent} />
        ))}
        {[
          [44, 28],
          [18, 50],
          [38, 22],
          [27, 51],
          [45, 48],
        ].map(([x, y]) => (
          <circle key={`s${x}${y}`} cx={x} cy={y} r="0.5" fill={theme.ink} opacity="0.8" />
        ))}
        {/* the names and the date */}
        <rect x="21" y="63" width="18" height="1.8" rx="0.9" fill={theme.ink} opacity="0.9" />
        <rect x="17" y="67.5" width="26" height="1.1" rx="0.55" fill={theme.muted} />
        <rect x="22" y="70.5" width="16" height="1.1" rx="0.55" fill={theme.muted} />
      </svg>
    </span>
  );
}

/** The colours of the poster, as a row of small posters in each look that scrolls sideways. */
export function StylePicker({ value, onChange }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <ChoiceGroup
      name="poster-style"
      legend={t('styleLabel')}
      value={value}
      onChange={onChange}
      className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 md:-mx-7 md:px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      choiceClassName="w-[6.75rem] shrink-0 snap-start p-2"
      badge
      choices={POSTER_STYLES.map((s) => ({
        value: s,
        content: (
          <span className="flex flex-col items-center gap-2">
            <MiniPoster style={s} />
            <span className="flex min-h-8 items-center text-center text-[12px] leading-4 text-white/60 group-has-[:checked]/choice:font-semibold group-has-[:checked]/choice:text-white">
              {t(`styles.${s}`)}
            </span>
          </span>
        ),
      }))}
    />
  );
}
