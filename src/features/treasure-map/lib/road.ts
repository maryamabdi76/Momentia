import { mulberry32 } from '../../moon/lib/random.ts';
import { smoothOpenPath, type Point } from './map-geometry.ts';
import { artSrc, type MapArt } from './art.ts';
import { iconMarkup, type IconPalette, type MapIcon } from './illustrations.ts';

/** What the road layout takes from the theme, on top of what the pictures need. */
export type RoadPalette = IconPalette & { muted: string; onAccent: string; /** The paper, so a picture can clear the road behind it. */ bg: string };

export type RoadStop = { title: string; city: string; date: string; icon?: MapIcon; art?: MapArt };

type Helpers = {
  /** Centred, right-to-left text. */
  text: (x: number, y: number, size: number, weight: number, fill: string, s: string) => string;
  digits: (s: string) => string;
  num: (v: number) => number;
  /** A dark theme: watercolour pictures get a light patch to sit on. */
  dark?: boolean;
  /** The ink theme: black pen drawings, a crisp road and no colour fills. */
  lineArt?: boolean;
  /** Embedded pictures by id (an exported file); otherwise they are linked. */
  artImages?: Partial<Record<MapArt, string>>;
};

export type RoadPlan = {
  /** Many moments: the place and the date share one line so every block is shorter. */
  compact: boolean;
  /** The road, as points to draw a smooth curve through. */
  road: Point[];
  stops: Array<{
    /** The place on the road the picture sits at. */
    x: number;
    y: number;
    /** The picture's centre: on the road, so the road runs into it and out again. */
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
  const scale = count <= 3 ? 1.4 : count <= 4 ? 1.3 : count <= 6 ? 1.1 : 0.95;
  const textH = compact ? 62 : 96;
  // the biggest a picture can get, and the room its words need below it
  const rMax = 56 * scale * 1.12;
  const startMin = 300 + rMax + 26;
  const lastMax = 1262 - rMax - textH - 14;
  const gap = Math.min(340, (lastMax - startMin) / (passes - 1));
  const y0 = startMin + (lastMax - startMin - gap * (passes - 1)) / 2;

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
      const sz = scale * (0.92 + rnd() * 0.2);
      const rr = 56 * sz;
      stops.push({
        x: p.x,
        y: p.y,
        px: p.x,
        py: p.y,
        r: rr,
        scale: sz,
        tilt: (rnd() - 0.5) * 6,
        textY: p.y + rr * 1.12 + 30,
        bottom: p.y + rr * 1.12 + textH,
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

function doodle(kind: Doodle, x: number, y: number, size: number, p: RoadPalette, turn: number, lineArt = false): string {
  // in line art a shape is outlined and left paper-coloured instead of washed with the accent
  const wash = (op: number) => (lineArt ? `fill="${p.card}"` : `fill="${p.accent}" fill-opacity="${op}"`);
  const s = `stroke="${p.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const g = (inner: string) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(${(size / 40).toFixed(3)})">${inner}</g>`;
  switch (kind) {
    case 'heart':
      return g(`<path d="M0 14C-18 2-16-12-6-13C-2-13.5 0-10 0-8C0-10 2-13.5 6-13C16-12 18 2 0 14Z" ${wash(0.75)} ${s}/>`);
    case 'tree':
      return g(`<path d="M0-18L-11 2H11ZM0-6L-14 12H14Z" fill="${p.park}" ${s}/><path d="M0 12V19" fill="none" ${s}/>`);
    case 'star':
      return g(`<path d="M0-15L4-4L15-3L7 5L9 16L0 10L-9 16L-7 5L-15-3L-4-4Z" ${wash(0.6)} ${s}/>`);
    case 'sparkle':
      return g(`<path d="M0-14V14M-14 0H14M-7-7L7 7M7-7L-7 7" fill="none" stroke="${p.accent}" stroke-width="2.4" stroke-linecap="round"/>`);
    case 'cloud':
      return g(`<path d="M-16 8Q-22 8-20 0Q-18-6-11-4Q-9-14 2-12Q10-12 11-4Q20-4 18 4Q18 8 14 8Z" fill="${p.card}" ${s}/>`);
    case 'flower':
      return g(
        `<path d="M0 4V18" fill="none" ${s}/>` +
          [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-8" rx="4.5" ry="7" transform="rotate(${a})" ${wash(0.45)} ${s}/>`).join('') +
          `<circle r="3.5" fill="${p.card}" ${s}/>`,
      );
    case 'compass':
      return g(
        `<circle r="18" fill="${p.card}" ${s}/><circle r="13" fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="1"/>` +
          `<path d="M0-13L4 0L0 13L-4 0Z" ${wash(0.85)} ${s}/><path d="M0 0L4 0" fill="none" ${s}/>` +
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
  // painted like the pictures: a dark-brown pen edge, a sandy wash inside and dotted stitches down the middle
  // (line art: black pen on paper; dark theme: a pale path)
  const look = h.lineArt
    ? { edge: p.ink, edgeOp: 1, edgeW: 31, sand: p.card, sandOp: 1, sandW: 27.8, lane: p.ink, laneOp: 0.8, laneW: 1.8, dash: '9 11' }
    : h.dark
      ? { edge: '#E6D3A8', edgeOp: 0.85, edgeW: 32, sand: '#8A7552', sandOp: 0.55, sandW: 28.6, lane: '#F1E3BF', laneOp: 0.8, laneW: 2.2, dash: '2 10' }
      : { edge: '#6E4E36', edgeOp: 0.9, edgeW: 32, sand: '#EBDCB8', sandOp: 1, sandW: 28.6, lane: '#8A6A4C', laneOp: 0.75, laneW: 2.4, dash: '2 10' };
  body.push(
    `<g filter="url(#${id}-paint)">` +
      `<path d="${road}" ${line} stroke="${look.edge}" stroke-opacity="${look.edgeOp}" stroke-width="${look.edgeW}"/>` +
      `<path d="${road}" ${line} stroke="${look.sand}" stroke-opacity="${look.sandOp}" stroke-width="${look.sandW}"/>` +
      (h.lineArt ? '' : `<path d="${road}" ${line} stroke="#FFF6DC" stroke-opacity="0.35" stroke-width="12"/>`) +
      `<path d="${road}" ${line} stroke="${look.lane}" stroke-opacity="${look.laneOp}" stroke-width="${look.laneW}" stroke-dasharray="${look.dash}"/>` +
      `</g>`,
  );

  // doodles go where nothing else is: off the road, the pictures and the words
  const rnd = mulberry32(99 + stops.length);
  const track = sampleRoad(plan.road);
  const taken: Array<{ x: number; y: number; r: number }> = plan.stops.map((s) => {
    const top = s.py - s.r * 1.12;
    return { x: s.px, y: (top + s.bottom) / 2, r: (s.bottom - top) / 2 + 40 };
  });
  const free = (x: number, y: number, r: number) =>
    x > 80 && x < 820 && y > 300 && y < 1255 &&
    track.every((t) => Math.hypot(t.x - x, t.y - y) > 36 + r) &&
    taken.every((o) => Math.hypot(o.x - x, o.y - y) > o.r + r);
  // the line-art prints are full of small trees
  const kinds: Doodle[] = h.lineArt
    ? ['tree', 'tree', 'sparkle', 'tree', 'heart', 'tree', 'tree', 'flower', 'tree', 'star']
    : ['heart', 'tree', 'star', 'sparkle', 'cloud', 'flower', 'heart', 'tree', 'sparkle'];
  const placed: string[] = [];
  const place = (kind: Doodle, size: number, tries: number) => {
    for (let i = 0; i < tries; i++) {
      const x = 80 + rnd() * 740;
      const y = 300 + rnd() * 955;
      if (!free(x, y, size * 0.6)) continue;
      taken.push({ x, y, r: size * 0.9 });
      placed.push(doodle(kind, x, y, size, p, (rnd() - 0.5) * 24, h.lineArt));
      return;
    }
  };
  place('compass', 58, 500);
  const budget = (h.lineArt ? 30 : 12) + Math.max(0, 8 - stops.length) * 2;
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
    // the picture sits on the road: a clearing of paper hides the road behind it, so the road
    // runs up to the picture and out the other side
    const clearing = `<ellipse cx="${n(s.px)}" cy="${n(s.py)}" rx="${n(s.r * 1.2)}" ry="${n(s.r * 1.12)}" fill="${p.bg}"/>`;
    const picture = m.art
      ? (h.dark ? `<rect x="${n(s.px - s.r)}" y="${n(s.py - s.r)}" width="${n(2 * s.r)}" height="${n(2 * s.r)}" rx="${n(s.r * 0.3)}" fill="#FBF8F1" fill-opacity="0.92"/>` : '') +
        `<image href="${h.artImages?.[m.art] ?? artSrc(m.art, h.lineArt ? 'line' : 'color')}" x="${n(s.px - s.r * 1.08)}" y="${n(s.py - s.r * 1.08)}" width="${n(s.r * 2.16)}" height="${n(s.r * 2.16)}" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${n(s.px)}" cy="${n(s.py)}" r="${n(s.r)}" fill="${p.land}" fill-opacity="0.7"/>` +
        `<g filter="url(#${id}-wobble)" transform="translate(${n(s.px - 50 * s.scale)} ${n(s.py - 50 * s.scale)}) scale(${n(s.scale * 100) / 100})">${iconMarkup(m.icon ?? 'star', p)}</g>`;
    body.push(`<g transform="rotate(${n(s.tilt)} ${n(s.px)} ${n(s.py)})">${clearing}${picture}${words}</g>`);
  });

  // the road's edges wander a little, and the painted ones get a fine grain, like watercolour on rough paper
  const grain = h.lineArt
    ? ''
    : `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="g"/>` +
      `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.43  0 0 0 0 0.31  0 0 0 0 0.2  0 0 0 0.9 -0.34" result="speck"/>` +
      `<feComposite in="speck" in2="d" operator="in" result="sp"/><feMerge><feMergeNode in="d"/><feMergeNode in="sp"/></feMerge>`;
  const defs =
    `<filter id="${id}-wobble" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/></filter>` +
    `<filter id="${id}-paint" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="1350">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" result="d"/>` +
    (grain || `<feMerge><feMergeNode in="d"/></feMerge>`) +
    `</filter>`;
  return { defs, body: body.join('') };
}
