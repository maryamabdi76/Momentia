/**
 * Shared types for the sky feature.
 *
 * Catalog coordinates are J2000 equatorial, in degrees. Everything that comes
 * out of `computeSky` is already projected into chart space: a unit disc whose
 * edge is the horizon, north up, east LEFT (the way the sky looks when you lie
 * on your back and look up), y growing downwards like SVG.
 */

/** [ra, dec, magnitude, B−V] — right ascension and declination in degrees. */
export type CatalogStar = readonly [
  ra: number,
  dec: number,
  mag: number,
  bv: number,
];

/** One polyline of a constellation figure, as [ra, dec] degree pairs. */
export type CatalogPath = ReadonlyArray<readonly [ra: number, dec: number]>;

export type ConstellationLines = {
  /** IAU three-letter abbreviation, e.g. "UMa". */
  id: string;
  paths: readonly CatalogPath[];
};

/** One drawn part of a constellation figure, as [ra, dec] degree points (J2000). */
export type CatalogArtShape = {
  closed: boolean;
  /** Filled silhouette (a body part) rather than a bare line. */
  fill: boolean;
  points: ReadonlyArray<readonly [ra: number, dec: number]>;
};

/** The artwork of one constellation: a figure drawn around its stars. */
export type ConstellationArt = {
  id: string;
  shapes: readonly CatalogArtShape[];
};

export type SkyCatalog = {
  stars: readonly CatalogStar[];
  lines: readonly ConstellationLines[];
  /** Optional figure artwork; without it the "figures" layer draws nothing. */
  art?: readonly ConstellationArt[];
};

export type PlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export type Point = { x: number; y: number };

export type SkyStar = Point & { mag: number; bv: number };

export type SkyPlanet = Point & {
  id: PlanetId;
  /** Approximate visual magnitude (Saturn's rings are ignored). */
  mag: number;
  altitude: number;
  azimuth: number;
};

export type SkyMoon = Point & {
  altitude: number;
  azimuth: number;
  /** Above the horizon (topocentric). */
  visible: boolean;
  /** Illuminated fraction of the disc, 0 (new) … 1 (full). */
  illumination: number;
  /** Ecliptic elongation from the Sun in degrees: 0 new, 90 first quarter, 180 full, 270 last quarter. */
  elongation: number;
  waxing: boolean;
  /**
   * Direction of the bright limb in chart space, degrees, using SVG's
   * convention (0 = +x, 90 = +y i.e. pointing down the screen).
   */
  brightLimbAngle: number;
};

export type SkySnapshot = {
  /** ISO timestamp of the instant that was computed. */
  instant: string;
  latitude: number;
  longitude: number;
  /** Altitude of the Sun in degrees; below about −12° the sky is properly dark. */
  sunAltitude: number;
  /** Faintest first, so brighter stars paint on top. */
  stars: SkyStar[];
  /** Constellation figures, already clipped at the horizon. */
  lines: Array<Array<[x: number, y: number]>>;
  /**
   * The sky under the horizon, in the same chart coordinates (so beyond radius 1).
   * Only present when `computeSky` is called with `extendBelowHorizon`.
   */
  below?: {
    stars: SkyStar[];
    lines: Array<Array<[x: number, y: number]>>;
  };
  /**
   * Constellation figures (the hunter, the swan …) for the constellations that
   * have artwork and are at least partly above the horizon. Shapes are not
   * clipped; the chart's horizon circle cuts them.
   */
  art: Array<{
    id: string;
    shapes: Array<{ closed: boolean; fill: boolean; points: Array<[x: number, y: number]> }>;
  }>;
  /** The celestial equator and the ecliptic, clipped at the horizon like `lines`. */
  guides: {
    equator: Array<Array<[x: number, y: number]>>;
    ecliptic: Array<Array<[x: number, y: number]>>;
  };
  /** Always present; check `moon.visible` before drawing it. */
  moon: SkyMoon;
  planets: SkyPlanet[];
};
