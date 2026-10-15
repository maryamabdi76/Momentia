import { skyCatalog } from '../../sky/catalog.ts';
import { computeSky } from '../../sky/lib/compute.ts';
import type { SkySnapshot } from '../../sky/lib/types.ts';
import { resolveMoment, type MomentInput, type ResolvedMoment } from './moment.ts';

export type MomentSky = {
  sky: SkySnapshot;
  moment: ResolvedMoment;
};

/** The sky for what the person typed in step 1, or null while the form is unusable. */
export function skyForMoment(
  input: MomentInput,
  /** Degrees of sky to also compute below the horizon (the full-page template). */
  extendBelowHorizon?: number,
): MomentSky | null {
  const moment = resolveMoment(input);
  if (!moment) return null;
  const sky = computeSky({
    latitude: moment.latitude,
    longitude: moment.longitude,
    date: moment.instant,
    catalog: skyCatalog,
    extendBelowHorizon,
  });
  return { sky, moment };
}
