import { getTranslations } from 'next-intl/server';
import { moonFactsFromSky } from '@/features/moon/lib/facts';
import { MOON_PHASES, type MoonPhaseKey } from '@/features/moon/lib/phase';
import type { MoonLabels, MoonPosterData } from '@/features/moon/lib/moon-svg';
import { skyForMoment } from '@/features/poster/lib/sky-for-moment';

type Night = Parameters<typeof skyForMoment>[0];

/** What the home and gallery pages need to draw sample Moon posters. */
export async function getMoonSamples() {
  const tMoon = await getTranslations('MoonPage');
  const tPoster = await getTranslations('Poster');

  const words = {
    phases: Object.fromEntries(MOON_PHASES.map((k) => [k, tMoon(`phases.${k}`)])) as Record<
      MoonPhaseKey,
      string
    >,
    lit: (percent: string) => tMoon('lit', { percent }),
  };
  const labels: MoonLabels = {
    headerLine: tMoon('headerLine'),
    watermark: tPoster('watermark'),
    timeAt: tPoster('timeAt'),
    mapAlt: tMoon('posterAlt'),
  };

  return {
    labels,
    /** The Moon of a given night, or null if the night can't be resolved. */
    factsFor(night: Night) {
      const sky = skyForMoment(night)?.sky;
      return sky ? moonFactsFromSky(sky, words) : null;
    },
  };
}

export const MOON_SAMPLE_BASE: Omit<
  MoonPosterData,
  'style' | 'title' | 'names' | 'quote' | 'dateLabel'
> = {
  showDate: true,
  showCity: true,
  showDetails: true,
  showStars: true,
  city: 'تهران',
  timeLabel: '۲۱:۰۰',
};
