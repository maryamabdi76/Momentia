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
 * Projects a path of East/North/Up directions onto the chart, cutting it where
 * it crosses the horizon. Returns the pieces that are above it.
 */
function clipToHorizon(path: readonly Vec3[]): Array<Array<[number, number]>> {
  const pieces: Array<Array<[number, number]>> = [];
  let piece: Array<[number, number]> = [];
  const flush = () => {
    if (piece.length > 1) pieces.push(piece);
    piece = [];
  };
  const add = (v: Vec3) => {
    const p = chartPoint(v);
    piece.push([p.x, p.y]);
  };

  let prev: Vec3 | null = null;
  for (const cur of path) {
    if (prev === null) {
      if (cur[2] >= 0) add(cur);
    } else {
      const aUp = prev[2] >= 0;
      const bUp = cur[2] >= 0;
      if (aUp && bUp) {
        add(cur);
      } else if (aUp !== bUp) {
        // Crossing: the chord's point on the horizon plane, pushed back to the sphere.
        const t = prev[2] / (prev[2] - cur[2]);
        const edge = unit([
          prev[0] + t * (cur[0] - prev[0]),
          prev[1] + t * (cur[1] - prev[1]),
          0,
        ]);
        if (aUp) {
          add(edge);
          flush();
        } else {
          add(edge);
          add(cur);
        }
      }
    }
    prev = cur;
  }
  flush();
  return pieces;
}

/**
 * Everything visible from `latitude`/`longitude` at `date`, already projected
 * into chart space. Pure and synchronous (a few milliseconds), so it can run on
 * every keystroke.
 */
export function computeSky(options: ComputeSkyOptions): SkySnapshot {
  const { latitude, longitude, date, catalog, limitMagnitude = Infinity } = options;

  const T = centuriesTT(date);
  const lst = localSiderealDegrees(date, longitude);
  const toEnu = enuMatrix(lst, latitude);
  // Catalog coordinates are J2000; rotate them to the equator of date, then to the horizon.
  const j2000ToEnu = multiplyMat3(toEnu, precessionMatrix(T));

  // ── stars ──────────────────────────────────────────────────────────────────
  const stars: SkyStar[] = [];
  for (const [ra, dec, mag, bv] of catalog.stars) {
    if (mag > limitMagnitude) continue;
    const enu = applyMat3(j2000ToEnu, raDecToVector(ra, dec));
    if (enu[2] <= 0) continue; // below the horizon
    const { x, y } = chartPoint(enu);
    stars.push({ x, y, mag, bv });
  }
  stars.sort((a, b) => b.mag - a.mag); // faint first → bright stars paint on top

  // ── constellation lines, clipped where they cross the horizon ─────────────
  const lines: SkySnapshot['lines'] = [];
  for (const figure of catalog.lines) {
    for (const path of figure.paths) {
      lines.push(
        ...clipToHorizon(
          path.map(([ra, dec]) => applyMat3(j2000ToEnu, raDecToVector(ra, dec))),
        ),
      );
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
    moon,
    planets,
  };
}
