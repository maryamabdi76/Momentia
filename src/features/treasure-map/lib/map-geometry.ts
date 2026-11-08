import { IRAN_OUTLINE } from './iran-outline.ts';

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; width: number; height: number };

const MIN_LON = 44;
const MAX_LON = 63.5;
const MIN_LAT = 25;
const MAX_LAT = 39.8;
/** Longitude degrees shrink with latitude; this keeps Iran from looking stretched. */
const LON_SCALE = Math.cos((32 * Math.PI) / 180);

/** Returns a function that places [lon, lat] inside `box`, keeping Iran's true proportions. */
export function createProjection(box: Box, padding = 24) {
  const spanX = (MAX_LON - MIN_LON) * LON_SCALE;
  const spanY = MAX_LAT - MIN_LAT;
  const scale = Math.min((box.width - padding * 2) / spanX, (box.height - padding * 2) / spanY);
  const offsetX = box.x + (box.width - spanX * scale) / 2;
  const offsetY = box.y + (box.height - spanY * scale) / 2;
  return (lon: number, lat: number): Point => ({
    x: offsetX + (lon - MIN_LON) * LON_SCALE * scale,
    y: offsetY + (MAX_LAT - lat) * scale,
  });
}

const r = (v: number) => Math.round(v * 10) / 10;

/** A smooth closed curve through the points (Catmull-Rom turned into cubic Béziers). */
export function smoothClosedPath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return '';
  let d = `M${r(points[0]!.x)} ${r(points[0]!.y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    d += curveTo(p0, p1, p2, p3);
  }
  return d + 'Z';
}

/** A smooth open curve through the points, in order. */
export function smoothOpenPath(points: Point[]): string {
  if (points.length < 2) return '';
  let d = `M${r(points[0]!.x)} ${r(points[0]!.y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    d += curveTo(p0, p1, p2, p3);
  }
  return d;
}

function curveTo(p0: Point, p1: Point, p2: Point, p3: Point): string {
  const t = 1 / 6;
  const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
  const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
  return `C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`;
}

export function iranOutlinePath(project: ReturnType<typeof createProjection>): string {
  return smoothClosedPath(
    // every other point: a softer silhouette, not a survey
    IRAN_OUTLINE.filter((_, i) => i % 2 === 0).map(([lon, lat]) => project(lon, lat)),
  );
}

/**
 * Pins that share a city would sit on top of each other, so they are fanned out
 * around it, in order, on a small circle.
 */
export function spreadPins(points: Point[], keys: string[], radius = 20): Point[] {
  const groups = new Map<string, number[]>();
  keys.forEach((k, i) => groups.set(k, [...(groups.get(k) ?? []), i]));
  const out = points.map((p) => ({ ...p }));
  for (const idxs of groups.values()) {
    if (idxs.length < 2) continue;
    idxs.forEach((idx, j) => {
      const angle = -Math.PI / 2 + (j * 2 * Math.PI) / idxs.length;
      out[idx] = {
        x: points[idx]!.x + Math.cos(angle) * radius,
        y: points[idx]!.y + Math.sin(angle) * radius,
      };
    });
  }
  return out;
}
