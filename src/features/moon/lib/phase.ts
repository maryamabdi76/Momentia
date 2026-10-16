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
