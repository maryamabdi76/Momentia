import { IRAN_CITIES } from '../../poster/lib/cities.ts';
import { POSTER_FRAMES } from '../../poster/lib/frames.ts';
import { MAP_ART } from './art.ts';
import { MAP_ICONS } from './illustrations.ts';
import {
  MAP_LAYOUTS,
  MAP_SCOPES,
  MAP_SHAPES,
  MAP_THEMES,
  MIN_MILESTONES,
  maxMilestones,
  type TreasureMapData,
} from './map-svg.ts';

/** How long each piece of text may be; the form's fields use the same limits. */
export const MAX_LENGTH = { title: 40, names: 40, momentTitle: 24, place: 22, date: 18 } as const;

const DEFAULTS = { layout: 'single', scope: 'city', area: 'تهران', theme: 'paper', shape: 'circle', frame: 'minimal' } as const;

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max).trim() : '');

function pickOptional<T extends string>(list: readonly T[], v: unknown): T | undefined {
  return typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : undefined;
}

function pick<T extends string>(list: readonly T[], v: unknown, fallback: T): T {
  return typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function coordinate(v: unknown, limit: number): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= limit ? v : undefined;
}

/**
 * Whatever came out of storage (an older version, a hand-edited value, a half-written save) as a map
 * that is safe to show: an unknown value falls back to its default, text is cut to length, a place
 * without both coordinates loses them, and extra moments beyond the layout's room are dropped.
 * Null only when there is nothing worth keeping.
 */
/** A repaired map always has both switches set, unlike the loosely typed data the poster is drawn from. */
export type SanitizedMap = TreasureMapData & { showArea: boolean; showCoords: boolean };

export function sanitizeMap(raw: unknown): SanitizedMap | null {
  if (!isRecord(raw)) return null;
  const layout = pick(MAP_LAYOUTS, raw.layout, DEFAULTS.layout);
  const list = Array.isArray(raw.milestones) ? raw.milestones : [];
  const milestones = list
    .filter(isRecord)
    .slice(0, maxMilestones(layout))
    .map((m) => {
      const lat = coordinate(m.lat, 90);
      const lon = coordinate(m.lon, 180);
      const placed = lat !== undefined && lon !== undefined;
      const icon = pickOptional(MAP_ICONS, m.icon);
      const art = pickOptional(MAP_ART, m.art);
      return {
        title: text(m.title, MAX_LENGTH.momentTitle),
        city: text(m.city, MAX_LENGTH.place),
        date: text(m.date, MAX_LENGTH.date),
        ...(placed ? { lat, lon } : {}),
        ...(icon ? { icon } : {}),
        ...(art ? { art } : {}),
      };
    });
  if (milestones.length < MIN_MILESTONES) return null;
  const area = typeof raw.area === 'string' && IRAN_CITIES.some((c) => c.name === raw.area) ? raw.area : DEFAULTS.area;
  return {
    title: text(raw.title, MAX_LENGTH.title),
    names: text(raw.names, MAX_LENGTH.names),
    layout,
    scope: pick(MAP_SCOPES, raw.scope, DEFAULTS.scope),
    area,
    theme: pick(MAP_THEMES, raw.theme, DEFAULTS.theme),
    shape: pick(MAP_SHAPES, raw.shape, DEFAULTS.shape),
    frame: pick(POSTER_FRAMES, raw.frame, DEFAULTS.frame),
    showArea: typeof raw.showArea === 'boolean' ? raw.showArea : true,
    showCoords: typeof raw.showCoords === 'boolean' ? raw.showCoords : false,
    milestones,
  };
}
