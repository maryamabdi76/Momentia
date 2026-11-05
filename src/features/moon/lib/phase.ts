/**
 * The Moon's phase as drawing instructions. Everything here is pure geometry on
 * a disc of radius `r` centred on (0, 0), y growing downwards like SVG.
 */

export const MOON_PHASES = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
] as const;
export type MoonPhaseKey = (typeof MOON_PHASES)[number];

/** Which of the eight classic phases an elongation (0° new … 180° full, degrees from the Sun) falls in. */
export function phaseKey(elongation: number): MoonPhaseKey {
  const e = ((elongation % 360) + 360) % 360;
  return MOON_PHASES[Math.floor(((e + 22.5) % 360) / 45)]!;
}

const f2 = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * Outline of the sunlit part, as seen from the northern hemisphere: a waxing
 * Moon is lit on the right, a waning one on the left.
 *
 * The lit region is a half-disc bounded by the limb on one side and by the
 * terminator on the other; the terminator is half of an ellipse whose width is
 * |1 − 2·illumination|·r, bulging towards the dark side for a gibbous Moon and
 * towards the lit side for a crescent.
 */
export function litPath(r: number, illumination: number, waxing: boolean): string {
  const k = Math.max(0, Math.min(1, illumination));
  const rx = r * Math.abs(1 - 2 * k);
  const gibbous = k > 0.5;
  // limb: top → bottom through the lit side; terminator: back up again.
  // Mirroring for a waning Moon just flips both sweep directions.
  const limb = waxing ? 1 : 0;
  const terminator = (gibbous ? 1 : 0) ^ (waxing ? 0 : 1);
  return `M0 ${f2(-r)}A${f2(r)} ${f2(r)} 0 0 ${limb} 0 ${f2(r)}A${f2(rx)} ${f2(r)} 0 0 ${terminator} 0 ${f2(-r)}Z`;
}

/** The unlit part: the disc minus the lit outline (fill with the even-odd rule). */
export function shadowPath(r: number, illumination: number, waxing: boolean): string {
  const disc = `M${f2(-r)} 0A${f2(r)} ${f2(r)} 0 1 0 ${f2(r)} 0A${f2(r)} ${f2(r)} 0 1 0 ${f2(-r)} 0Z`;
  return disc + litPath(r, illumination, waxing);
}

/** Seen from the southern hemisphere the Moon is upside down. */
export function moonRotation(latitude: number): 0 | 180 {
  return latitude < 0 ? 180 : 0;
}

const RAD = 180 / Math.PI;
const DEG = Math.PI / 180;

/**
 * Where the bright limb points on the sky, as a position angle in degrees: 0 is
 * celestial north, 90 east, 270 west (Meeus, Astronomical Algorithms, ch. 48).
 * It is the direction from the Moon towards the Sun, so it changes through the
 * year as the Sun–Moon line tilts against the celestial poles.
 */
export function brightLimbPositionAngle(
  moon: { ra: number; dec: number },
  sun: { ra: number; dec: number },
): number {
  const dRa = (sun.ra - moon.ra) * DEG;
  const dm = moon.dec * DEG;
  const ds = sun.dec * DEG;
  const y = Math.cos(ds) * Math.sin(dRa);
  const x = Math.sin(ds) * Math.cos(dm) - Math.cos(ds) * Math.sin(dm) * Math.cos(dRa);
  return (Math.atan2(y, x) * RAD + 360) % 360;
}

/**
 * How far to turn the upright drawing (lit side on the right for a waxing Moon, on
 * the left for a waning one) so the lit side faces where the Sun is. The Moon is
 * drawn north up with east on the left, as the eye sees it from the northern
 * hemisphere, so a bright limb at position angle χ points to (−sin χ, −cos χ) on
 * screen. Degrees clockwise, in (−180, 180].
 */
export function litAxisRotation(positionAngle: number, waxing: boolean): number {
  const chi = positionAngle * DEG;
  const onScreen = Math.atan2(-Math.cos(chi), -Math.sin(chi)) * RAD;
  const turn = onScreen - (waxing ? 0 : 180);
  return Math.round((((turn + 180) % 360 + 360) % 360 - 180) * 100) / 100 || 0;
}

/**
 * How the sunlit side darkens towards the terminator, as the stops of a gradient
 * running from the terminator (offset 0) to the bright limb (offset 1) along the
 * Moon's lit axis. `alpha` is the share of the shadow colour laid over the surface:
 * 1 where the surface is unlit, 0 where it is as bright as the full Moon.
 *
 * The Moon is not a smooth ball: its brightness follows the Lommel–Seeliger law,
 * B = μ0 / (μ0 + μ), with μ0 the cosine of the angle of the Sun and μ that of the
 * viewer, both to the surface normal. At full phase that is the same everywhere (the
 * flat disc we know), and the nearer to the terminator, the dimmer — which is the
 * soft fade seen on a half or gibbous Moon.
 *
 * `from` is where the terminator crosses the lit axis, in radii from the centre
 * towards the lit side (1 − 2k), so the gradient runs from `from` to 1.
 */
export function limbShade(
  illumination: number,
  steps = 12,
): { from: number; stops: { offset: number; alpha: number }[] } | null {
  const k = Math.max(0, Math.min(1, illumination));
  const cos = 2 * k - 1; // cosine of the phase angle
  const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
  const from = 1 - 2 * k;
  if (from >= 0.999) return null; // new Moon: nothing is lit
  const stops: { offset: number; alpha: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const offset = i / steps;
    const x = from + offset * (1 - from);
    const z = Math.sqrt(Math.max(0, 1 - x * x));
    const mu0 = Math.max(0, x * sin + z * cos);
    const b = z > 0 ? mu0 / (mu0 + z) : 1;
    const alpha = Math.max(0, 1 - Math.min(1, b / 0.5));
    stops.push({ offset, alpha: Math.round(alpha * 1000) / 1000 });
  }
  return stops.every((s) => s.alpha === 0) ? null : { from, stops };
}
