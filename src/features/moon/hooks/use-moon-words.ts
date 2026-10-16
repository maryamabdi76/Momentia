'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { SkySnapshot } from '@/features/sky/lib/types';
import { moonFactsFromSky } from '../lib/facts';
import { MOON_PHASES, type MoonPhaseKey } from '../lib/phase';
import type { MoonFacts, MoonLabels } from '../lib/moon-svg';

/** The Moon's facts for a sky, plus the fixed words of the poster, in Persian. */
export function useMoonWords(sky: SkySnapshot | null): {
  facts: MoonFacts | null;
  labels: MoonLabels;
} {
  const t = useTranslations('MoonPage');
  const tPoster = useTranslations('Poster');

  const facts = useMemo(() => {
    if (!sky) return null;
    const phases = Object.fromEntries(
      MOON_PHASES.map((k) => [k, t(`phases.${k}`)]),
    ) as Record<MoonPhaseKey, string>;
    return moonFactsFromSky(sky, { phases, lit: (percent) => t('lit', { percent }) });
  }, [sky, t]);

  const labels: MoonLabels = {
    headerLine: t('headerLine'),
    watermark: tPoster('watermark'),
    timeAt: tPoster('timeAt'),
    mapAlt: t('posterAlt'),
  };
  return { facts, labels };
}
