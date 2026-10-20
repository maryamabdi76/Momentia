/**
 * Which parts of the sky are drawn. Every option is optional for the person
 * making the poster; the defaults reproduce the chart as it looked before the
 * options existed.
 */
export type SkyLayers = {
  /** Constellation outlines. */
  constellationLines: boolean;
  /** Figures drawn over the constellations: the hunter, the swan, the bear… */
  constellationArt: boolean;
  /** Moon and planets. */
  moonAndPlanets: boolean;
  /** Names next to the planets (only meaningful with `moonAndPlanets`). */
  planetNames: boolean;
  /** The ecliptic: the Sun's yearly path, along which the planets travel. */
  ecliptic: boolean;
  /** The celestial equator. */
  equator: boolean;
  /** Draw stars brighter than this magnitude (smaller = fewer stars). */
  maxMagnitude: number;
};

/** Star-density presets offered in the form. */
export const MAGNITUDE_PRESETS = [3.5, 4.6, 5.5] as const;

export const DEFAULT_SKY_LAYERS: SkyLayers = {
  constellationLines: true,
  constellationArt: false,
  moonAndPlanets: true,
  planetNames: true,
  ecliptic: false,
  equator: false,
  maxMagnitude: 4.6,
};

/** Fills in anything missing (older drafts, partial props). */
export function resolveSkyLayers(layers?: Partial<SkyLayers> | null): SkyLayers {
  return { ...DEFAULT_SKY_LAYERS, ...layers };
}
