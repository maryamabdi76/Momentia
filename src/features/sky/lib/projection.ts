import { RAD, enuToAltAz, type Vec3 } from './astro.ts';
import type { Point } from './types.ts';

/**
 * Stereographic projection of an East/North/Up direction onto the chart.
 *
 * The zenith lands at the centre, the horizon on the unit circle, north at the
 * top and east on the LEFT — the view of someone lying down and looking up.
 * Stereographic keeps shapes (and therefore constellations) undistorted and
 * turns great circles into circles, which is why planetaria like it.
 *
 * With u = sin(altitude): r = cos(alt) / (1 + sin(alt)), so
 *   x = −east / (1 + u),  y = −north / (1 + u)      (y grows downwards)
 */
export function chartPoint(enu: Vec3): Point {
  const norm = Math.hypot(enu[0], enu[1], enu[2]) || 1;
  const k = 1 + Math.max(enu[2] / norm, -0.999);
  return { x: -enu[0] / norm / k, y: -enu[1] / norm / k };
}

/** Same projection from altitude/azimuth, in degrees. */
export function chartPointFromAltAz(altitude: number, azimuth: number): Point {
  const z = (90 - altitude) / RAD;
  const r = Math.tan(z / 2);
  const az = azimuth / RAD;
  return { x: -r * Math.sin(az), y: -r * Math.cos(az) };
}

export { enuToAltAz };
