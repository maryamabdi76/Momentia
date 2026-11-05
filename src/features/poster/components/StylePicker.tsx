'use client';

import { useTranslations } from 'next-intl';
import { POSTER_STYLES, POSTER_THEMES, paperCss, type PosterStyle } from '../lib/themes';
import { ChoiceGroup } from './ChoiceGroup';

type Props = {
  value: PosterStyle;
  onChange: (style: PosterStyle) => void;
};

/** The colours of the poster, as a row of swatches. */
export function StylePicker({ value, onChange }: Props) {
  const t = useTranslations('CreatePage.step2');

  return (
    <ChoiceGroup
      name="poster-style"
      legend={t('styleLabel')}
      value={value}
      onChange={onChange}
      className="flex flex-wrap gap-2"
      choiceClassName="rounded-full"
      choices={POSTER_STYLES.map((s) => ({
        value: s,
        content: (
          <span className="flex items-center gap-2 py-1.5 ps-2 pe-3.5">
            <span
              aria-hidden
              className="size-6 shrink-0 rounded-full border"
              style={{ background: paperCss(POSTER_THEMES[s]), borderColor: POSTER_THEMES[s].frame }}
            />
            <span className="text-[13px] text-white/60 group-has-[:checked]/choice:font-medium group-has-[:checked]/choice:text-white">
              {t(`styles.${s}`)}
            </span>
          </span>
        ),
      }))}
    />
  );
}
