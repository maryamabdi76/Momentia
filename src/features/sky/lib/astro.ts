/**
 * Low-level celestial mechanics: time scales, sidereal time, precession and
 * the equatorial → horizon transform. No dependencies, no I/O.
 *
 * Formulas follow Jean Meeus, "Astronomical Algorithms" (2nd ed.).
 */

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const J2000_JD = 2451545.0;

/**
 * TT − UT in seconds. It drifts about +0.5 s/year; the value for the years this
 * product covers (2011–2031) stays within ±2 s of 69 s, which moves the Moon by
 * roughly 0.001°, far below anything visible on a poster.
 */
export const DELTA_T_SECONDS = 69;

export type Vec3 = readonly [number, number, number];
/** Row-major 3×3 matrix. */
export type Mat3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

export function normalizeDegrees(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Wraps to (−180, 180]. */
export function normalizeSignedDegrees(deg: number): number {
  const r = normalizeDegrees(deg);
  return r > 180 ? r - 360 : r;
}

export function julianDayUT(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Julian centuries of dynamical time since J2000.0 — the "T" in Meeus. */
export function centuriesTT(date: Date): number {
  return (julianDayUT(date) + DELTA_T_SECONDS / 86400 - J2000_JD) / 36525;
}

/** Greenwich mean sidereal time in degrees (Meeus 12.4). */
export function gmstDegrees(date: Date): number {
  const d = julianDayUT(date) - J2000_JD;
  const T = d / 36525;
  return normalizeDegrees(
    280.46061837 +
      360.98564736629 * d +
      0.000387933 * T * T -
      (T * T * T) / 38710000,
  );
}

/** Local mean sidereal time in degrees; longitude is positive east. */
export function localSiderealDegrees(date: Date, longitudeEast: number): number {
  return normalizeDegrees(gmstDegrees(date) + longitudeEast);
}

/** Mean obliquity of the ecliptic in degrees (Meeus 22.2). */
export function meanObliquityDegrees(T: number): number {
  return 23.439291111 - 0.013004167 * T - 1.639e-7 * T * T + 5.036e-7 * T * T * T;
}

// ─── vectors & matrices ──────────────────────────────────────────────────────

export function raDecToVector(raDeg: number, decDeg: number): Vec3 {
  const ra = raDeg * DEG;
  const dec = decDeg * DEG;
  const c = Math.cos(dec);
  return [c * Math.cos(ra), c * Math.sin(ra), Math.sin(dec)];
}

export function vectorToRaDec(v: Vec3): { ra: number; dec: number } {
  const r = Math.hypot(v[0], v[1], v[2]);
  return {
    ra: normalizeDegrees(Math.atan2(v[1], v[0]) * RAD),
    dec: Math.asin(Math.max(-1, Math.min(1, v[2] / r))) * RAD,
  };
}

export function applyMat3(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

export function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  const out: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]);
    }
  }
  return out as unknown as Mat3;
}

// ─── precession ──────────────────────────────────────────────────────────────

/**
 * Precesses equatorial coordinates from J2000.0 to the mean equator and
 * equinox of date (Meeus 21.2–21.4). `T` is Julian centuries since J2000.0.
 */
export function precessFromJ2000(
  raDeg: number,
  decDeg: number,
  T: number,
): { ra: number; dec: number } {
  const arcsec = DEG / 3600;
  const zeta = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T ** 3) * arcsec;
  const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T ** 3) * arcsec;
  const theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T ** 3) * arcsec;

  const a0 = raDeg * DEG;
  const d0 = decDeg * DEG;
  const A = Math.cos(d0) * Math.sin(a0 + zeta);
  const B =
    Math.cos(theta) * Math.cos(d0) * Math.cos(a0 + zeta) -
    Math.sin(theta) * Math.sin(d0);
  const C =
    Math.sin(theta) * Math.cos(d0) * Math.cos(a0 + zeta) +
    Math.cos(theta) * Math.sin(d0);

  return {
    ra: normalizeDegrees(Math.atan2(A, B) * RAD + z * RAD),
    dec: Math.asin(Math.max(-1, Math.min(1, C))) * RAD,
  };
}

/**
 * The J2000 → of-date precession as a matrix, so thousands of stars can be
 * rotated with plain multiplications. Built by precessing the three axes: the
 * images of the basis vectors are the columns.
 */
export function precessionMatrix(T: number): Mat3 {
  const axes: Vec3[] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const cols = axes.map((axis) => {
    const { ra, dec } = vectorToRaDec(axis);
    const p = precessFromJ2000(ra, dec, T);
    return raDecToVector(p.ra, p.dec);
  });
  return [
    cols[0][0], cols[1][0], cols[2][0],
    cols[0][1], cols[1][1], cols[2][1],
    cols[0][2], cols[1][2], cols[2][2],
  ];
}

// ─── equatorial → horizon ────────────────────────────────────────────────────

/**
 * Rotation from equatorial-of-date vectors to a local East/North/Up frame for
 * an observer at `latitude` whose local sidereal time is `lst` (both degrees).
 */
export function enuMatrix(lstDeg: number, latitudeDeg: number): Mat3 {
  const s = Math.sin(lstDeg * DEG);
  const c = Math.cos(lstDeg * DEG);
  const sp = Math.sin(latitudeDeg * DEG);
  const cp = Math.cos(latitudeDeg * DEG);
  return [
    -s, c, 0,
    -sp * c, -sp * s, cp,
    cp * c, cp * s, sp,
  ];
}

/** Altitude and azimuth (north = 0°, east = 90°) from an East/North/Up vector. */
export function enuToAltAz(v: Vec3): { altitude: number; azimuth: number } {
  const r = Math.hypot(v[0], v[1], v[2]);
  return {
    altitude: Math.asin(Math.max(-1, Math.min(1, v[2] / r))) * RAD,
    azimuth: normalizeDegrees(Math.atan2(v[0], v[1]) * RAD),
  };
}

export function altAzToEnu(altitudeDeg: number, azimuthDeg: number): Vec3 {
  const alt = altitudeDeg * DEG;
  const az = azimuthDeg * DEG;
  return [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
}

/** Convenience for single bodies; stars go through `enuMatrix` directly. */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  lstDeg: number,
  latitudeDeg: number,
): { altitude: number; azimuth: number } {
  return enuToAltAz(applyMat3(enuMatrix(lstDeg, latitudeDeg), raDecToVector(raDeg, decDeg)));
}

/** Ecliptic (of date) → equatorial (of date), degrees. */
export function eclipticToEquatorial(
  lambdaDeg: number,
  betaDeg: number,
  obliquityDeg: number,
): { ra: number; dec: number } {
  const l = lambdaDeg * DEG;
  const b = betaDeg * DEG;
  const e = obliquityDeg * DEG;
  const ra = Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l),
  );
  const dec = Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l),
  );
  return { ra: normalizeDegrees(ra * RAD), dec: dec * RAD };
}

/** Equatorial (of date) → ecliptic (of date), degrees. */
export function equatorialToEcliptic(
  raDeg: number,
  decDeg: number,
  obliquityDeg: number,
): { lambda: number; beta: number } {
  const a = raDeg * DEG;
  const d = decDeg * DEG;
  const e = obliquityDeg * DEG;
  const lambda = Math.atan2(
    Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e),
    Math.cos(a),
  );
  const beta = Math.asin(
    Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a),
  );
  return { lambda: normalizeDegrees(lambda * RAD), beta: beta * RAD };
}

/** Great-circle separation between two directions, degrees. */
export function angularSeparation(
  ra1: number,
  dec1: number,
  ra2: number,
  dec2: number,
): number {
  const a = raDecToVector(ra1, dec1);
  const b = raDecToVector(ra2, dec2);
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = Math.hypot(
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  );
  return Math.atan2(cross, dot) * RAD;
}
