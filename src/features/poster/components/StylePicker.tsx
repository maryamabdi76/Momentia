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
  return (
    <span
      aria-hidden
      className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg shadow-md ring-1 ring-black/20"
      style={{ background: paperCss(theme) }}
    >
      <span className="absolute inset-1.5 rounded-[3px] border" style={{ borderColor: theme.frame }} />
      {theme.glow && (
        <span
          className="absolute left-1/2 top-[34%] size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-md"
          style={{ background: theme.glow }}
        />
      )}
      <span
        className="absolute left-1/2 top-[34%] size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: theme.frameSoft, background: `radial-gradient(circle at 35% 30%, ${theme.accent}33, transparent 60%)` }}
      >
        {[
          ['22%', '30%'],
          ['58%', '24%'],
          ['70%', '58%'],
          ['36%', '68%'],
          ['48%', '46%'],
        ].map(([x, y]) => (
          <span key={`${x}${y}`} className="absolute size-[3px] rounded-full" style={{ left: x, top: y, background: theme.accent }} />
        ))}
      </span>
      <span className="absolute inset-x-[22%] bottom-[19%] h-[3px] rounded-full" style={{ background: theme.ink, opacity: 0.85 }} />
      <span className="absolute inset-x-[32%] bottom-[12%] h-[2px] rounded-full" style={{ background: theme.muted }} />
    </span>
  );
}

/** The colours of the poster, as small posters in each look. */
export function StylePicker({ value, onChange }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <ChoiceGroup
      name="poster-style"
      legend={t('styleLabel')}
      value={value}
      onChange={onChange}
      className="grid grid-cols-3 gap-2.5"
      choiceClassName="p-2"
      badge
      choices={POSTER_STYLES.map((s) => ({
        value: s,
        content: (
          <span className="flex flex-col items-center gap-2">
            <MiniPoster style={s} />
            <span className="text-[12px] leading-4 text-white/60 group-has-[:checked]/choice:font-semibold group-has-[:checked]/choice:text-white">
              {t(`styles.${s}`)}
            </span>
          </span>
        ),
      }))}
    />
  );
}
