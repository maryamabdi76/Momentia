import { MIN_MILESTONES, maxMilestones, type MapLayout } from './map-svg.ts';

/** Why a map cannot be made yet, in the order the person can fix them. */
export type MapProblem = 'tooFew' | 'tooMany' | 'needPlaces';

type Moment = { lat?: number; lon?: number };

/**
 * What stops a map being finished: too few or too many moments for the layout, or (on a layout drawn
 * around real places) a moment whose place was not picked on the map. Empty when the map is ready.
 */
export function mapProblems(map: { layout: MapLayout; milestones: readonly Moment[] }): MapProblem[] {
  const problems: MapProblem[] = [];
  const count = map.milestones.length;
  if (count < MIN_MILESTONES) problems.push('tooFew');
  if (count > maxMilestones(map.layout)) problems.push('tooMany');
  if (map.layout !== 'road' && map.milestones.some((m) => m.lat === undefined || m.lon === undefined)) {
    problems.push('needPlaces');
  }
  return problems;
}
