import { mulberry32 } from '../../moon/lib/random.ts';
import { smoothOpenPath, type Point } from './map-geometry.ts';
import { iconMarkup, type IconPalette, type MapIcon } from './illustrations.ts';

/** What the road layout takes from the theme, on top of what the pictures need. */
export type RoadPalette = IconPalette & { muted: string; onAccent: string };

export type RoadStop = { title: string; city: string; date: string; icon?: MapIcon };

type Helpers = {
  /** Centred, right-to-left text. */
  text: (x: number, y: number, size: number, weight: number, fill: string, s: string) => string;
  digits: (s: string) => string;
  num: (v: number) => number;
};

export type RoadPlan = {
  /** Many moments: the place and the date share one line so every block is shorter. */
  compact: boolean;
  /** The road, as points to draw a smooth curve through. */
  road: Point[];
  stops: Array<{
    /** Where the number sits, on the road. */
    x: number;
    y: number;
    /** The picture's centre, below the road. */
    px: number;
    py: number;
    /** Half the width of the picture's patch. */
    r: number;
    /** Scale of the drawing, tilt in degrees. */
    scale: number;
    tilt: number;
    /** Where the words start, and the block's bottom. */
    textY: number;
    bottom: number;
  }>;
};

const LEFT = 120;
const RIGHT = 780;
const MID_X = 450;

/** Wobble of the road within a pass: it never runs dead straight. */
const wobble = (t: number, phase: number, amp: number) => Math.sin((t * 1.15 + phase) * Math.PI * 2) * amp;

/**
 * A road that winds back and forth across the sheet, two moments to a pass, with each moment's
 * picture and words hanging below its place on the road. Sizes, tilts and small offsets vary a
 * little, from a fixed seed, so it feels drawn by hand. The first moment is at the right.
 */
export function planRoad(count: number, seed = 7): RoadPlan {
  const rnd = mulberry32(seed + count * 31);
  const passes = Math.max(2, Math.ceil(count / 2));
  // few moments get big pictures; many get small ones so everything fits
  const compact = count > 6;
  const scale = count <= 3 ? 1.4 : count <= 4 ? 1.3 : count <= 6 ? 1.1 : 0.74;
  const textH = compact ? 62 : 96;
  const r = 56 * scale;
  const gapBelowRoad = 20;
  // room for the biggest picture, the words below it and the extra drop of the lower one
  const blockH = gapBelowRoad + 2 * r * 1.12 + textH + 36;
  const top = compact ? 312 : 340;
  const bottom = 1258;
  const gap = Math.min(340, (bottom - top - blockH) / (passes - 1));
  const y0 = top + (bottom - top - blockH - gap * (passes - 1)) / 2;

  const road: Point[] = [{ x: RIGHT + 60, y: y0 - 80 }];
  const stops: RoadPlan['stops'] = [];
  let made = 0;
  for (let k = 0; k < passes; k++) {
    const rightToLeft = k % 2 === 0;
    const base = y0 + k * gap;
    const phase = rnd();
    const amp = 14 + rnd() * 12;
    const xs = rightToLeft ? RIGHT : LEFT;
    const xe = rightToLeft ? LEFT : RIGHT;
    const at = (t: number): Point => ({ x: xs + (xe - xs) * t, y: base + wobble(t, phase, amp) });
    for (let i = 0; i <= 6; i++) road.push(at(i / 6));
    // the moments on this pass
    const inPass = Math.min(2, count - made);
    const marks = inPass === 0 ? [] : inPass === 2 ? [0.2 + rnd() * 0.08, 0.64 + rnd() * 0.1] : [0.42 + rnd() * 0.16];
    marks.forEach((t, j) => {
      const p = at(t);
      // the second picture hangs a little lower than the first
      const drop = j === 1 ? 20 + rnd() * 14 : rnd() * 10;
      const sz = scale * (0.92 + rnd() * 0.2);
      const rr = 56 * sz;
      stops.push({
        x: p.x,
        y: p.y,
        px: p.x + (rnd() - 0.5) * 26,
        py: p.y + gapBelowRoad + rr + drop,
        r: rr,
        scale: sz,
        tilt: (rnd() - 0.5) * 7,
        textY: p.y + gapBelowRoad + 2 * rr + drop + 30,
        bottom: p.y + gapBelowRoad + 2 * rr + drop + textH,
      });
    });
    made += inPass;
    // a wide turn at the edge, before the next pass
    if (k < passes - 1) {
      const out = rightToLeft ? -1 : 1;
      road.push({ x: xe + out * 66, y: base + gap / 2 });
    }
  }
  const lastEnd = passes % 2 === 1 ? LEFT : RIGHT;
  road.push({ x: lastEnd + (lastEnd === LEFT ? -40 : 40), y: y0 + (passes - 1) * gap + 40 });
  return { compact, road, stops };
}

/** The curve `smoothOpenPath` draws, as a polyline, to keep decorations off the road. */
function sampleRoad(points: Point[], per = 10): Point[] {
  const out: Point[] = [];
  const t = 1 / 6;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    for (let j = 0; j < per; j++) {
      const u = j / per;
      const v = 1 - u;
      out.push({
        x: v * v * v * p1.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * p2.x,
        y: v * v * v * p1.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * p2.y,
      });
    }
  }
  return out;
}

type Doodle = 'heart' | 'tree' | 'star' | 'sparkle' | 'cloud' | 'flower' | 'compass';

function doodle(kind: Doodle, x: number, y: number, size: number, p: RoadPalette, turn: number): string {
  const s = `stroke="${p.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const g = (inner: string) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(${(size / 40).toFixed(3)})">${inner}</g>`;
  switch (kind) {
    case 'heart':
      return g(`<path d="M0 14C-18 2-16-12-6-13C-2-13.5 0-10 0-8C0-10 2-13.5 6-13C16-12 18 2 0 14Z" fill="${p.accent}" fill-opacity="0.75" ${s}/>`);
    case 'tree':
      return g(`<path d="M0-18L-11 2H11ZM0-6L-14 12H14Z" fill="${p.park}" ${s}/><path d="M0 12V19" fill="none" ${s}/>`);
    case 'star':
      return g(`<path d="M0-15L4-4L15-3L7 5L9 16L0 10L-9 16L-7 5L-15-3L-4-4Z" fill="${p.accent}" fill-opacity="0.6" ${s}/>`);
    case 'sparkle':
      return g(`<path d="M0-14V14M-14 0H14M-7-7L7 7M7-7L-7 7" fill="none" stroke="${p.accent}" stroke-width="2.4" stroke-linecap="round"/>`);
    case 'cloud':
      return g(`<path d="M-16 8Q-22 8-20 0Q-18-6-11-4Q-9-14 2-12Q10-12 11-4Q20-4 18 4Q18 8 14 8Z" fill="${p.card}" ${s}/>`);
    case 'flower':
      return g(
        `<path d="M0 4V18" fill="none" ${s}/>` +
          [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-8" rx="4.5" ry="7" transform="rotate(${a})" fill="${p.accent}" fill-opacity="0.45" ${s}/>`).join('') +
          `<circle r="3.5" fill="${p.card}" ${s}/>`,
      );
    case 'compass':
      return g(
        `<circle r="18" fill="${p.card}" ${s}/><circle r="13" fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="1"/>` +
          `<path d="M0-13L4 0L0 13L-4 0Z" fill="${p.accent}" fill-opacity="0.85" ${s}/><path d="M0 0L4 0" fill="none" ${s}/>` +
          `<path d="M0-22V-18M0 18V22M-22 0H-18M18 0H22" fill="none" ${s}/>`,
      );
  }
}

/**
 * The illustrated road: a winding road across the sheet, a numbered stop for each moment with its
 * picture and words hanging below, and small doodles in the gaps. Returns the markup and the filter it needs.
 */
export function roadSvg(stops: RoadStop[], p: RoadPalette, id: string, h: Helpers): { defs: string; body: string } {
  const n = h.num;
  const plan = planRoad(stops.length);
  const body: string[] = [];

  const road = smoothOpenPath(plan.road);
  const line = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  body.push(
    `<path d="${road}" ${line} stroke="${p.ink}" stroke-opacity="0.5" stroke-width="34"/>`,
    `<path d="${road}" ${line} stroke="${p.card}" stroke-width="29"/>`,
    `<path d="${road}" ${line} stroke="${p.ink}" stroke-opacity="0.45" stroke-width="2.4" stroke-dasharray="9 11"/>`,
  );

  // doodles go where nothing else is: off the road, the pictures and the words
  const rnd = mulberry32(99 + stops.length);
  const track = sampleRoad(plan.road);
  const taken: Array<{ x: number; y: number; r: number }> = plan.stops.map((s) => ({ x: s.px, y: (s.py + s.bottom) / 2, r: Math.max(s.r + 60, 130) }));
  const free = (x: number, y: number, r: number) =>
    x > 80 && x < 820 && y > 300 && y < 1255 &&
    track.every((t) => Math.hypot(t.x - x, t.y - y) > 36 + r) &&
    taken.every((o) => Math.hypot(o.x - x, o.y - y) > o.r + r);
  const kinds: Doodle[] = ['heart', 'tree', 'star', 'sparkle', 'cloud', 'flower', 'heart', 'tree', 'sparkle'];
  const placed: string[] = [];
  const place = (kind: Doodle, size: number, tries: number) => {
    for (let i = 0; i < tries; i++) {
      const x = 80 + rnd() * 740;
      const y = 300 + rnd() * 955;
      if (!free(x, y, size * 0.6)) continue;
      taken.push({ x, y, r: size * 0.9 });
      placed.push(doodle(kind, x, y, size, p, (rnd() - 0.5) * 24));
      return;
    }
  };
  place('compass', 58, 500);
  const budget = 12 + Math.max(0, 8 - stops.length) * 2;
  for (let i = 0; i < budget; i++) place(kinds[i % kinds.length]!, 22 + rnd() * 14, 160);
  body.push(...placed);

  stops.forEach((m, i) => {
    const s = plan.stops[i]!;
    // the picture and its words, tilted a little together
    const words = [
      h.text(s.px, s.textY, plan.compact ? 22 : 24, 700, p.ink, m.title),
      plan.compact
        ? h.text(s.px, s.textY + 24, 15, 400, p.muted, h.digits([m.city, m.date].filter(Boolean).join(' · ')))
        : h.text(s.px, s.textY + 26, 17, 400, p.muted, m.city),
      !plan.compact && m.date ? h.text(s.px, s.textY + 49, 16, 400, p.accent, h.digits(m.date)) : '',
    ].join('');
    body.push(
      `<g transform="rotate(${n(s.tilt)} ${n(s.px)} ${n(s.py)})">` +
        `<circle cx="${n(s.px)}" cy="${n(s.py)}" r="${n(s.r)}" fill="${p.land}" fill-opacity="0.7"/>` +
        `<g filter="url(#${id}-wobble)" transform="translate(${n(s.px - 50 * s.scale)} ${n(s.py - 50 * s.scale)}) scale(${n(s.scale * 100) / 100})">${iconMarkup(m.icon ?? 'star', p)}</g>` +
        words +
        `</g>`,
    );
    // a short dotted line from the road down to the picture, then the number on the road
    body.push(
      `<path d="M${n(s.x)} ${n(s.y + 20)}L${n(s.px)} ${n(s.py - s.r)}" fill="none" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="2.2" stroke-dasharray="1 8" stroke-linecap="round"/>`,
      `<circle cx="${n(s.x)}" cy="${n(s.y)}" r="20" fill="${p.accent}" stroke="${p.card}" stroke-width="3.5"/>`,
      h.text(s.x, s.y + 7, 20, 700, p.onAccent, h.digits(String(i + 1))),
    );
  });

  const defs =
    `<filter id="${id}-wobble" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/></filter>`;
  return { defs, body: body.join('') };
}
