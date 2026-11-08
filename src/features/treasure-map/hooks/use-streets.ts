'use client';

import { useEffect, useMemo, useState } from 'react';
import { MAP_RADIUS, type Milestone, type TreasureMapData } from '../lib/map-svg';
import { boundsKm, frameView, viewBounds } from '../lib/mercator';
import { fetchStreets, type StreetData } from '../lib/streets';

export type StreetsState = {
  streets: StreetData | null;
  status: 'idle' | 'loading' | 'ready' | 'error' | 'too-far';
};

/** Beyond this the places are in different cities; one street map of all of it would be unreadable. */
const MAX_KM = 60;
/** Beyond this only main roads are asked for, to keep the answer small. */
const MAJOR_ONLY_KM = 12;

const cache = new Map<string, StreetData>();

const picked = (ms: Milestone[]) =>
  ms.filter((m): m is Milestone & { lat: number; lon: number } => typeof m.lat === 'number' && typeof m.lon === 'number');

/**
 * Real streets around the picked places, from OpenStreetMap. It waits for the user to
 * stop editing, asks once per area, and remembers the answer.
 */
export function useStreets(data: TreasureMapData): StreetsState {
  const [state, setState] = useState<StreetsState>({ streets: null, status: 'idle' });

  const plan = useMemo(() => {
    if (data.scope !== 'city' || data.milestones.length === 0) return null;
    const pts = picked(data.milestones);
    if (pts.length !== data.milestones.length) return null;
    const view = frameView(pts.map((m) => ({ lon: m.lon, lat: m.lat })), MAP_RADIUS);
    const bounds = viewBounds(view, MAP_RADIUS);
    const km = boundsKm(bounds);
    const majorOnly = km > MAJOR_ONLY_KM;
    const key = [bounds.south, bounds.west, bounds.north, bounds.east].map((v) => v.toFixed(4)).join(',') + (majorOnly ? 'M' : 'A');
    return { bounds, km, majorOnly, key };
  }, [data]);

  const key = plan?.key ?? null;
  useEffect(() => {
    if (!plan) {
      setState({ streets: null, status: 'idle' });
      return;
    }
    if (plan.km > MAX_KM) {
      setState({ streets: null, status: 'too-far' });
      return;
    }
    const hit = cache.get(plan.key);
    if (hit) {
      setState({ streets: hit, status: 'ready' });
      return;
    }
    const ctrl = new AbortController();
    setState((s) => ({ streets: s.streets, status: 'loading' }));
    const timer = setTimeout(() => {
      fetchStreets(plan.bounds, plan.majorOnly, ctrl.signal)
        .then((streets) => {
          cache.set(plan.key, streets);
          setState({ streets, status: 'ready' });
        })
        .catch((err: unknown) => {
          if (ctrl.signal.aborted) return;
          console.error(err);
          setState({ streets: null, status: 'error' });
        });
    }, 800);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // `plan` is derived from `key`; the key is what says the area changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
