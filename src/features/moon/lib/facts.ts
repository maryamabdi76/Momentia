import type { SkySnapshot } from '../../sky/lib/types.ts';
import { centuriesTT } from '../../sky/lib/astro.ts';
import { moonPosition, sunPosition } from '../../sky/lib/ephemeris.ts';
import type { MoonFacts } from './moon-svg.ts';
import { brightLimbPositionAngle, litAxisRotation, phaseKey, type MoonPhaseKey } from './phase.ts';

/** Persian digits for the percentage under the Moon. */
const toPersianDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);

/** What the Moon looked like in `sky`, with the caption worded by the caller's translations. */
export function moonFactsFromSky(
  sky: SkySnapshot,
  words: {
    phases: Record<MoonPhaseKey, string>;
    /** e.g. (percent) => `${percent}٪ روشن` */
    lit: (percent: string) => string;
  },
): MoonFacts {
  const { illumination, elongation, waxing } = sky.moon;
  const percent = toPersianDigits(String(Math.round(illumination * 100)));
  // which way the lit side faces: it follows the Sun, so it tilts with the date and hour
  const T = centuriesTT(new Date(sky.instant));
  const litRotation = litAxisRotation(brightLimbPositionAngle(moonPosition(T), sunPosition(T)), waxing);
  return {
    illumination,
    waxing,
    litRotation,
    latitude: sky.latitude,
    phaseLine: `${words.phases[phaseKey(elongation)]} · ${words.lit(percent)}`,
  };
}
