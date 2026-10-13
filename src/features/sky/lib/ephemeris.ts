/**
 * Positions of the Sun, Moon and naked-eye planets, with no dependencies.
 *
 * Everything returned is geocentric, referred to the mean equator and equinox
 * of date (the same frame as local sidereal time), in degrees.
 *
 *  • Sun   — Meeus ch. 25 (low accuracy, ≈ 0.01°).
 *  • Moon  — Meeus ch. 47 with the 60 largest longitude/distance terms and 30
 *            latitude terms (≈ 0.01° — 1/50 of the Moon's own width).
 *  • Planets — JPL "Keplerian Elements for Approximate Positions of the Major
 *            Planets", table valid 1800–2050 (a few arcminutes at worst).
 *
 * That is far more precision than a printed poster can show. If it ever needs
 * to be swapped for a heavier library, this file is the only seam: keep the
 * exported function signatures and the tests in `__tests__/ephemeris.test.ts`
 * will tell you whether the replacement agrees.
 */

import {
  DEG,
  RAD,
  eclipticToEquatorial,
  meanObliquityDegrees,
  normalizeDegrees,
  precessFromJ2000,
} from './astro.ts';
import type { PlanetId } from './types.ts';

export const AU_KM = 149597870.7;
export const EARTH_EQUATORIAL_RADIUS_KM = 6378.14;

export type BodyPosition = {
  /** Right ascension of date, degrees. */
  ra: number;
  /** Declination of date, degrees. */
  dec: number;
};

// ─── Sun ─────────────────────────────────────────────────────────────────────

export type SunPosition = BodyPosition & {
  /** Distance in astronomical units. */
  distanceAu: number;
  /** Apparent ecliptic longitude of date, degrees. */
  lambda: number;
};

/** Apparent geocentric position of the Sun (Meeus ch. 25). */
export function sunPosition(T: number): SunPosition {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const Mr = M * DEG;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);

  const trueLongitude = L0 + C;
  const trueAnomaly = (M + C) * DEG;
  const distanceAu = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));

  const omega = (125.04 - 1934.136 * T) * DEG;
  const lambda = normalizeDegrees(trueLongitude - 0.00569 - 0.00478 * Math.sin(omega));
  const epsilon = meanObliquityDegrees(T) + 0.00256 * Math.cos(omega);

  const { ra, dec } = eclipticToEquatorial(lambda, 0, epsilon);
  return { ra, dec, distanceAu, lambda };
}

// ─── Moon ────────────────────────────────────────────────────────────────────

// Columns: D, M, M', F, Σl (1e-6 deg), Σr (1e-3 km)   — Meeus table 47.A
const MOON_LONGITUDE_DISTANCE: ReadonlyArray<
  readonly [number, number, number, number, number, number]
> = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0],
  [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322],
  [2, -2, 0, 0, 2236, -9884],
  [0, 1, 2, 0, -2120, 5751],
  [0, 2, 0, 0, -2069, 0],
  [2, -2, -1, 0, 2048, -4950],
  [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0],
  [4, -1, -1, 0, 1215, -3958],
  [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258],
  [2, 1, 1, 0, -810, 2616],
  [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117],
  [2, 2, -1, 0, -700, 2354],
  [2, 1, -2, 0, 691, 0],
  [2, -1, 0, -2, 596, 0],
  [4, 0, 1, 0, 549, -1423],
  [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571],
  [1, 0, -2, 0, -487, -1739],
  [2, 1, 0, -2, -399, 0],
  [0, 0, 2, -2, -381, -4421],
  [1, 1, 1, 0, 351, 0],
  [3, 0, -2, 0, -340, 0],
  [4, 0, -3, 0, 330, 0],
  [2, -1, 2, 0, 327, 0],
  [0, 2, 1, 0, -323, 1165],
  [1, 1, -1, 0, 299, 0],
  [2, 0, 3, 0, 294, 0],
  [2, 0, -1, -2, 0, 8752],
];

// Columns: D, M, M', F, Σb (1e-6 deg)   — Meeus table 47.B
const MOON_LATITUDE: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410],
  [0, 1, 0, -1, -1344],
  [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021],
  [4, 0, -1, 1, 833],
];

export type MoonPosition = BodyPosition & {
  /** Geocentric distance, km. */
  distanceKm: number;
  /** Geocentric ecliptic longitude of date (before nutation), degrees. */
  lambda: number;
  /** Geocentric ecliptic latitude, degrees. */
  beta: number;
};

/** Geocentric position of the Moon (Meeus ch. 47, truncated series). */
export function moonPosition(T: number): MoonPosition {
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const Lp = normalizeDegrees(
    218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000,
  );
  const D = normalizeDegrees(
    297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000,
  );
  const M = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = normalizeDegrees(
    134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000,
  );
  const F = normalizeDegrees(
    93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000,
  );

  const A1 = (119.75 + 131.849 * T) * DEG;
  const A2 = (53.09 + 479264.29 * T) * DEG;
  const A3 = (313.45 + 481266.484 * T) * DEG;

  // Eccentricity of Earth's orbit damps every term that contains the Sun's anomaly.
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const eFactor = (m: number) => (m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E);

  let sumL = 0;
  let sumR = 0;
  for (const [d, m, mp, f, sl, sr] of MOON_LONGITUDE_DISTANCE) {
    const arg = (d * D + m * M + mp * Mp + f * F) * DEG;
    const k = eFactor(m);
    sumL += sl * k * Math.sin(arg);
    sumR += sr * k * Math.cos(arg);
  }

  let sumB = 0;
  for (const [d, m, mp, f, sb] of MOON_LATITUDE) {
    const arg = (d * D + m * M + mp * Mp + f * F) * DEG;
    sumB += sb * eFactor(m) * Math.sin(arg);
  }

  // Additive terms: Venus, Jupiter and the flattening of the Earth.
  sumL +=
    3958 * Math.sin(A1) + 1962 * Math.sin((Lp - F) * DEG) + 318 * Math.sin(A2);
  sumB +=
    -2235 * Math.sin(Lp * DEG) +
    382 * Math.sin(A3) +
    175 * Math.sin(A1 - F * DEG) +
    175 * Math.sin(A1 + F * DEG) +
    127 * Math.sin((Lp - Mp) * DEG) -
    115 * Math.sin((Lp + Mp) * DEG);

  const lambda = normalizeDegrees(Lp + sumL / 1e6);
  const beta = sumB / 1e6;
  const distanceKm = 385000.56 + sumR / 1000;

  // Nutation in longitude, so the Moon and the (apparent) Sun share a frame.
  const omega = (125.04452 - 1934.136261 * T) * DEG;
  const apparentLambda = lambda - 0.00478 * Math.sin(omega);

  const { ra, dec } = eclipticToEquatorial(apparentLambda, beta, meanObliquityDegrees(T));
  return { ra, dec, distanceKm, lambda, beta };
}

// ─── Planets ─────────────────────────────────────────────────────────────────

/** [value at J2000, change per Julian century] */
type Rate = readonly [number, number];
type Elements = {
  a: Rate; // semi-major axis, AU
  e: Rate; // eccentricity
  I: Rate; // inclination, deg
  L: Rate; // mean longitude, deg
  w: Rate; // longitude of perihelion, deg
  O: Rate; // longitude of ascending node, deg
};

// JPL SSD "Keplerian elements for approximate positions of the major planets",
// Table 1 (1800 AD – 2050 AD), heliocentric, mean ecliptic & equinox of J2000.
const ELEMENTS: Record<PlanetId | 'earth', Elements> = {
  mercury: {
    a: [0.38709927, 0.00000037],
    e: [0.20563593, 0.00001906],
    I: [7.00497902, -0.00594749],
    L: [252.2503235, 149472.67411175],
    w: [77.45779628, 0.16047689],
    O: [48.33076593, -0.12534081],
  },
  venus: {
    a: [0.72333566, 0.0000039],
    e: [0.00677672, -0.00004107],
    I: [3.39467605, -0.0007889],
    L: [181.9790995, 58517.81538729],
    w: [131.60246718, 0.00268329],
    O: [76.67984255, -0.27769418],
  },
  earth: {
    a: [1.00000261, 0.00000562],
    e: [0.01671123, -0.00004392],
    I: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981],
    w: [102.93768193, 0.32327364],
    O: [0, 0],
  },
  mars: {
    a: [1.52371034, 0.00001847],
    e: [0.0933941, 0.00007882],
    I: [1.84969142, -0.00813131],
    L: [-4.55343205, 19140.30268499],
    w: [-23.94362959, 0.44441088],
    O: [49.55953891, -0.29257343],
  },
  jupiter: {
    a: [5.202887, -0.00011607],
    e: [0.04838624, -0.00013253],
    I: [1.30439695, -0.00183714],
    L: [34.39644051, 3034.74612775],
    w: [14.72847983, 0.21252668],
    O: [100.47390909, 0.20469106],
  },
  saturn: {
    a: [9.53667594, -0.0012506],
    e: [0.05386179, -0.00050991],
    I: [2.48599187, 0.00193609],
    L: [49.95424423, 1222.49362201],
    w: [92.59887831, -0.41897216],
    O: [113.66242448, -0.28867794],
  },
};

const OBLIQUITY_J2000 = 23.43928 * DEG;

const at = (r: Rate, T: number) => r[0] + r[1] * T;

/** Heliocentric rectangular coordinates, ecliptic & equinox of J2000, in AU. */
function heliocentric(el: Elements, T: number): [number, number, number] {
  const a = at(el.a, T);
  const e = at(el.e, T);
  const I = at(el.I, T) * DEG;
  const L = at(el.L, T);
  const w = at(el.w, T);
  const O = at(el.O, T) * DEG;

  const omega = (w - at(el.O, T)) * DEG; // argument of perihelion
  const M = ((((L - w) % 360) + 540) % 360 - 180) * DEG; // mean anomaly in (−π, π]

  // Kepler's equation by Newton's method; e < 0.21 so it converges in a few steps.
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }

  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cw = Math.cos(omega);
  const sw = Math.sin(omega);
  const cO = Math.cos(O);
  const sO = Math.sin(O);
  const cI = Math.cos(I);
  const sI = Math.sin(I);

  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    sw * sI * xp + cw * sI * yp,
  ];
}

// Absolute magnitude + phase-angle polynomial (Astronomical Almanac).
const MAGNITUDE: Record<PlanetId, (i: number) => number> = {
  mercury: (i) => -0.42 + 0.038 * i - 0.000273 * i * i + 0.000002 * i ** 3,
  venus: (i) => -4.4 + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i ** 3,
  mars: (i) => -1.52 + 0.016 * i,
  jupiter: (i) => -9.4 + 0.005 * i,
  saturn: () => -8.88, // ring brightening ignored; ±1 mag
};

export type PlanetPosition = BodyPosition & {
  distanceAu: number;
  /** Approximate apparent visual magnitude. */
  mag: number;
};

export const PLANET_IDS: readonly PlanetId[] = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
];

/** Geocentric positions of the naked-eye planets, of date. */
export function planetPositions(T: number): Record<PlanetId, PlanetPosition> {
  const earth = heliocentric(ELEMENTS.earth, T);
  const R = Math.hypot(...earth);

  const result = {} as Record<PlanetId, PlanetPosition>;
  for (const id of PLANET_IDS) {
    const p = heliocentric(ELEMENTS[id], T);
    const r = Math.hypot(...p);

    // Geocentric ecliptic → equatorial (both J2000), then precess to date.
    const gx = p[0] - earth[0];
    const gy = p[1] - earth[1];
    const gz = p[2] - earth[2];
    const delta = Math.hypot(gx, gy, gz);

    const ex = gx;
    const ey = Math.cos(OBLIQUITY_J2000) * gy - Math.sin(OBLIQUITY_J2000) * gz;
    const ez = Math.sin(OBLIQUITY_J2000) * gy + Math.cos(OBLIQUITY_J2000) * gz;

    const ra0 = normalizeDegrees(Math.atan2(ey, ex) * RAD);
    const dec0 = Math.asin(ez / delta) * RAD;
    const { ra, dec } = precessFromJ2000(ra0, dec0, T);

    const cosPhase = Math.max(-1, Math.min(1, (r * r + delta * delta - R * R) / (2 * r * delta)));
    const phaseAngle = Math.acos(cosPhase) * RAD;
    const mag = MAGNITUDE[id](phaseAngle) + 5 * Math.log10(r * delta);

    result[id] = { ra, dec, distanceAu: delta, mag };
  }
  return result;
}
