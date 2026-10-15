import {
  DEG,
  RAD,
  altAzToEnu,
  applyMat3,
  centuriesTT,
  eclipticToEquatorial,
  enuMatrix,
  enuToAltAz,
  localSiderealDegrees,
  meanObliquityDegrees,
  multiplyMat3,
  normalizeDegrees,
  precessionMatrix,
  raDecToVector,
  type Vec3,
} from './astro.ts';
import {
  AU_KM,
  EARTH_EQUATORIAL_RADIUS_KM,
  PLANET_IDS,
  moonPosition,
  planetPositions,
  sunPosition,
} from './ephemeris.ts';
import { chartPoint } from './projection.ts';
import type {
  SkyCatalog,
  SkyMoon,
  SkyPlanet,
  SkySnapshot,
  SkyStar,
} from './types.ts';

export type ComputeSkyOptions = {
  /** Degrees north. */
  latitude: number;
  /** Degrees east. */
  longitude: number;
  /** The instant, as a real point in time (UTC). */
  date: Date;
  catalog: SkyCatalog;
  /** Drop catalog stars fainter than this. Defaults to everything in the catalog. */
  limitMagnitude?: number;
  /**
   * Also return the sky below the horizon, down to this many degrees under it
   * (`snapshot.below`). A circular chart doesn't need it; a poster whose whole
   * rectangle is sky does, to fill the corners with real stars.
   */
  extendBelowHorizon?: number;
};

/** Altitude of the Sun in degrees (no refraction); handy for deciding whether it is night. */
export function sunAltitude(date: Date, latitude: number, longitude: number): number {
  const sun = sunPosition(centuriesTT(date));
  const lst = localSiderealDegrees(date, longitude);
  const enu = applyMat3(enuMatrix(lst, latitude), raDecToVector(sun.ra, sun.dec));
  return enuToAltAz(enu).altitude;
}

const unit = (v: Vec3): Vec3 => {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
};
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Cuts a path of East/North/Up directions at the plane z = `zc` and keeps the
 * parts on one side: above it, or below it. Where the path crosses, the chord's
 * point on the plane is pushed back onto the sphere.
 */
function clipHalf(path: readonly Vec3[], zc: number, keepAbove: boolean): Vec3[][] {
  const side = (v: Vec3) => (keepAbove ? v[2] - zc : zc - v[2]);
  const pieces: Vec3[][] = [];
  let piece: Vec3[] = [];
  const flush = () => {
    if (piece.length > 1) pieces.push(piece);
    piece = [];
  };

  let prev: Vec3 | null = null;
  for (const cur of path) {
    if (prev === null) {
      if (side(cur) >= 0) piece.push(cur);
    } else {
      const aIn = side(prev) >= 0;
      const bIn = side(cur) >= 0;
      if (aIn && bIn) {
        piece.push(cur);
      } else if (aIn !== bIn) {
        const t = (prev[2] - zc) / (prev[2] - cur[2]);
        // The crossing's bearing, placed exactly on the plane and on the sphere.
        const ex = prev[0] + t * (cur[0] - prev[0]);
        const ey = prev[1] + t * (cur[1] - prev[1]);
        const k = Math.sqrt(Math.max(0, 1 - zc * zc)) / (Math.hypot(ex, ey) || 1);
        const edge: Vec3 = [ex * k, ey * k, zc];
        if (aIn) {
          piece.push(edge);
          flush();
        } else {
          piece.push(edge, cur);
        }
      }
    }
    prev = cur;
  }
  flush();
  return pieces;
}

const project = (pieces: Vec3[][]): Array<Array<[number, number]>> =>
  pieces.map((piece) =>
    piece.map((v): [number, number] => {
      const p = chartPoint(v);
      return [p.x, p.y];
    }),
  );

/** The parts of a path above the horizon, projected onto the chart. */
const clipToHorizon = (path: readonly Vec3[]) => project(clipHalf(path, 0, true));

/** The parts between the horizon and `depth` degrees below it. */
function clipBelowHorizon(path: readonly Vec3[], depth: number) {
  const zMin = -Math.sin(depth * DEG);
  return project(
    clipHalf(path, 0, false).flatMap((piece) => clipHalf(piece, zMin, true)),
  );
}

/**
 * Everything visible from `latitude`/`longitude` at `date`, already projected
 * into chart space. Pure and synchronous (a few milliseconds), so it can run on
 * every keystroke.
 */
export function computeSky(options: ComputeSkyOptions): SkySnapshot {
  const {
    latitude,
    longitude,
    date,
    catalog,
    limitMagnitude = Infinity,
    extendBelowHorizon = 0,
  } = options;
  const depth = Math.min(Math.max(extendBelowHorizon, 0), 60);
  const zMin = -Math.sin(depth * DEG);

  const T = centuriesTT(date);
  const lst = localSiderealDegrees(date, longitude);
  const toEnu = enuMatrix(lst, latitude);
  // Catalog coordinates are J2000; rotate them to the equator of date, then to the horizon.
  const j2000ToEnu = multiplyMat3(toEnu, precessionMatrix(T));

  // ── stars ──────────────────────────────────────────────────────────────────
  const stars: SkyStar[] = [];
  const starsBelow: SkyStar[] = [];
  for (const [ra, dec, mag, bv] of catalog.stars) {
    if (mag > limitMagnitude) continue;
    const enu = applyMat3(j2000ToEnu, raDecToVector(ra, dec));
    if (enu[2] <= 0) {
      // below the horizon: only kept when the caller asked for the extended sky
      if (depth > 0 && enu[2] >= zMin) {
        const { x, y } = chartPoint(enu);
        starsBelow.push({ x, y, mag, bv });
      }
      continue;
    }
    const { x, y } = chartPoint(enu);
    stars.push({ x, y, mag, bv });
  }
  stars.sort((a, b) => b.mag - a.mag); // faint first → bright stars paint on top
  starsBelow.sort((a, b) => b.mag - a.mag);

  // ── constellation lines, clipped where they cross the horizon ─────────────
  const lines: SkySnapshot['lines'] = [];
  const linesBelow: SkySnapshot['lines'] = [];
  for (const figure of catalog.lines) {
    for (const path of figure.paths) {
      const enuPath = path.map(([ra, dec]) =>
        applyMat3(j2000ToEnu, raDecToVector(ra, dec)),
      );
      lines.push(...clipToHorizon(enuPath));
      if (depth > 0) linesBelow.push(...clipBelowHorizon(enuPath, depth));
    }
  }

  // ── celestial equator and ecliptic (both defined "of date", so no precession) ──
  const equator: SkySnapshot['lines'] = [];
  const ecliptic: SkySnapshot['lines'] = [];
  {
    const obliquity = meanObliquityDegrees(T);
    const equatorPath: Vec3[] = [];
    const eclipticPath: Vec3[] = [];
    for (let deg = 0; deg <= 360; deg++) {
      equatorPath.push(applyMat3(toEnu, raDecToVector(deg, 0)));
      const eq = eclipticToEquatorial(deg, 0, obliquity);
      eclipticPath.push(applyMat3(toEnu, raDecToVector(eq.ra, eq.dec)));
    }
    equator.push(...clipToHorizon(equatorPath));
    ecliptic.push(...clipToHorizon(eclipticPath));
  }

  // ── Sun (only its direction, for the Moon's phase and the twilight check) ──
  const sun = sunPosition(T);
  const sunEnu = applyMat3(toEnu, raDecToVector(sun.ra, sun.dec));
  const sunAlt = enuToAltAz(sunEnu).altitude;

  // ── Moon ───────────────────────────────────────────────────────────────────
  const moonPos = moonPosition(T);
  const moonEnu = applyMat3(toEnu, raDecToVector(moonPos.ra, moonPos.dec));
  const moonGeo = enuToAltAz(moonEnu);
  // The Moon is close enough that standing on the Earth's surface (instead of
  // its centre) drops it by up to ~1° — about two Moon-widths.
  const parallax = Math.asin(EARTH_EQUATORIAL_RADIUS_KM / moonPos.distanceKm) * RAD;
  const moonAlt = moonGeo.altitude - parallax * Math.cos(moonGeo.altitude * DEG);
  const moonPoint = chartPoint(altAzToEnu(moonAlt, moonGeo.azimuth));

  // Phase: the angle Sun–Moon–Earth, from the Sun–Moon separation on the sky.
  const sunDist = sun.distanceAu * AU_KM;
  const m = unit(moonEnu);
  const s = unit(sunEnu);
  const psi = Math.acos(Math.max(-1, Math.min(1, dot(m, s))));
  const phaseAngle = Math.atan2(sunDist * Math.sin(psi), moonPos.distanceKm - sunDist * Math.cos(psi));
  const illumination = (1 + Math.cos(phaseAngle)) / 2;
  const elongation = normalizeDegrees(moonPos.lambda - sun.lambda);

  // Which way the bright limb points *on the chart*: nudge the Moon a little
  // toward the Sun along the sky and see where both land. The projection is
  // conformal, so angles are preserved locally.
  const toSun = unit([s[0] - dot(s, m) * m[0], s[1] - dot(s, m) * m[1], s[2] - dot(s, m) * m[2]]);
  const nudged = unit([m[0] + 0.02 * toSun[0], m[1] + 0.02 * toSun[1], m[2] + 0.02 * toSun[2]]);
  const a = chartPoint(m);
  const b = chartPoint(nudged);
  const brightLimbAngle = Math.atan2(b.y - a.y, b.x - a.x) * RAD;

  const moon: SkyMoon = {
    x: moonPoint.x,
    y: moonPoint.y,
    altitude: moonAlt,
    azimuth: moonGeo.azimuth,
    visible: moonAlt > 0,
    illumination,
    elongation,
    waxing: elongation < 180,
    brightLimbAngle,
  };

  // ── planets ────────────────────────────────────────────────────────────────
  const planets: SkyPlanet[] = [];
  const positions = planetPositions(T);
  for (const id of PLANET_IDS) {
    const p = positions[id];
    const { altitude, azimuth } = enuToAltAz(applyMat3(toEnu, raDecToVector(p.ra, p.dec)));
    if (altitude <= 0) continue;
    const { x, y } = chartPoint(altAzToEnu(altitude, azimuth));
    planets.push({ id, x, y, mag: p.mag, altitude, azimuth });
  }

  return {
    instant: date.toISOString(),
    latitude,
    longitude,
    sunAltitude: sunAlt,
    stars,
    lines,
    guides: { equator, ecliptic },
    ...(depth > 0 ? { below: { stars: starsBelow, lines: linesBelow } } : {}),
    moon,
    planets,
  };
}
