import { mulberry32 } from '../../moon/lib/random.ts';
import { smoothOpenPath, type Point } from './map-geometry.ts';
import { fitFont } from './fit-text.ts';
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
    /** The pin's tip, on the road. */
    x: number;
    y: number;
    /** The picture's centre and the box it is fitted into. It sits beside the road, not on it. */
    px: number;
    py: number;
    boxW: number;
    boxH: number;
    /** Which side the picture is on: 1 right, -1 left. They alternate. */
    side: 1 | -1;
    /** Tilt of the picture, in degrees. */
    tilt: number;
    /** The first line of words; the block ends at `bottom`. */
    textY: number;
    bottom: number;
  }>;
};

const MID_X = 450;
const FIRST_Y = 390;
const LAST_BOTTOM = 1250;

/**
 * A road that winds down the sheet like a printed love map: each moment has a numbered pin on the
 * road with its words under it, and its picture beside it, large, on alternating sides. The road
 * swings out under each picture and comes back to the next pin. The first picture is at the right.
 */
export function planRoad(count: number, seed = 7): RoadPlan {
  const rnd = mulberry32(seed + count * 31);
  const compact = count > 6;
  const blockH = compact ? 64 : 96;
  const lastY = LAST_BOTTOM - blockH;
  const gap = count > 1 ? Math.min(330, (lastY - FIRST_Y) / (count - 1)) : 0;
  const y0 = count > 1 ? FIRST_Y + (lastY - FIRST_Y - gap * (count - 1)) / 2 : 640;
  // a picture may be taller than its row: the next one on its side is two rows away
  const boxH = count > 1 ? Math.min(310, 2 * gap - 34) : 310;
  // with few moments a picture may be big; with more, narrower and further out so it clears the words of the rows beside it
  const boxW = count <= 4 ? 290 : compact ? 250 : 270;
  const offset = count <= 4 ? 262 : compact ? 255 : 258;
  // a person drew this road, not a ruler: every bend, pin and picture is a little off its mark.
  // Room for a picture to move up or down without touching the next one on its side.
  const slack = count > 1 ? 2 * gap - 34 - boxH : 120;
  // ...and must still clear the next pin's words on the other side
  const clearBelow = count > 1 ? gap + (compact ? 26 : 34) - 66 - (60 + boxH / 2) - 2 : 40;
  const sway = Math.max(0, Math.min(26, slack / 2, clearBelow));
  const drop = count > 1 ? gap : 300;

  const sides: Array<1 | -1> = Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 1 : -1));
  // the words keep to a column (a picture on either side leaves no room to move them); the bends differ in depth
  const pinX = sides.map((side) => MID_X - side * 14);
  const depth = sides.map(() => 80 + rnd() * 95);
  // where in its stretch the road is at its widest: early or late
  const lean = sides.map(() => (rnd() - 0.5) * 0.22);
  const jit = (v: number) => (rnd() - 0.5) * v;

  const road: Point[] = [];
  const stops: RoadPlan['stops'] = [];
  // between two pins the road leaves one, swings out under the picture and comes back to the next,
  // as a bend that is deeper or shallower, earlier or later, and never quite smooth
  const along = (y: number, side: 1 | -1, u: number, x0: number, x1: number, d: number, k: number): Point => {
    const w = Math.sin(Math.PI * Math.pow(u, 1 - k));
    return { x: x0 + (x1 - x0) * u + side * d * w + jit(9), y: y + drop * u + jit(6) };
  };
  for (let i = 0; i < count; i++) {
    const side = sides[i]!;
    const y = y0 + i * gap;
    const x = pinX[i]!;
    if (i === 0) {
      // the road comes in from the side away from the first picture
      const away: 1 | -1 = side === 1 ? -1 : 1;
      const inX = MID_X + away * 150;
      road.push({ x: MID_X + away * 330, y: Math.max(300, y - drop * 0.62 - 40) });
      for (const u of [0.5, 0.7, 0.86]) {
        const pt = along(y - drop, away, u, inX - away * 20, x, 150, 0);
        road.push({ x: pt.x, y: Math.max(300, pt.y) });
      }
    }
    road.push({ x, y });
    if (i < count - 1) {
      const next = pinX[i + 1]!;
      for (const u of [0.14, 0.3, 0.5, 0.7, 0.86]) road.push(along(y, side, u, x, next, depth[i]!, lean[i]!));
    }
    stops.push({
      x,
      y,
      px: MID_X + side * offset,
      py: y + 60 + (rnd() - 0.5) * 2 * sway,
      boxW,
      boxH,
      side,
      tilt: (rnd() - 0.5) * 10,
      textY: y + (compact ? 26 : 34),
      bottom: y + blockH,
    });
  }
  const last = stops[count - 1]!;
  for (const u of [0.14, 0.3, 0.5]) {
    const pt = along(last.y, last.side, u, last.x, MID_X + last.side * 20, depth[count - 1]!, 0);
    road.push({ x: pt.x, y: Math.min(pt.y, 1225) });
  }
  road.push({ x: MID_X + last.side * 330, y: Math.min(last.y + drop * 0.8, 1256) });
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

type Doodle = 'heart' | 'tree' | 'star' | 'sparkle' | 'cloud' | 'flower' | 'compass' | 'leaf';

/** A small branch with leaves, watercolour green; `tip` is where the stem starts, the leaves reach up from it. */
function leafSprig(x: number, y: number, turn: number, size: number, dark: boolean, wrap?: (inner: string) => string): string {
  const leaf = dark ? '#7F9C86' : '#8FA86A';
  const edge = dark ? '#5E7A67' : '#6A8449';
  const blade = (cx: number, cy: number, a: number, len: number) =>
    `<path transform="translate(${cx} ${cy}) rotate(${a})" d="M0 0Q${len * 0.34} ${-len * 0.28} ${len} 0Q${len * 0.34} ${len * 0.28} 0 0Z" fill="${leaf}" fill-opacity="0.85" stroke="${edge}" stroke-opacity="0.6" stroke-width="0.8"/>`;
  const inner =
    `<path d="M0 0Q12-24 6-52" fill="none" stroke="${edge}" stroke-width="1.6" stroke-linecap="round"/>` +
    blade(2, -10, -20, 20) + blade(3, -10, 190, 17) +
    blade(7, -26, -35, 21) + blade(6, -27, 200, 18) +
    blade(8, -40, -55, 18) + blade(7, -41, 215, 15) +
    blade(6, -52, -80, 15);
  if (wrap) return wrap(inner);
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(${size.toFixed(2)})">${inner}</g>`;
}

/** A teardrop pin with its number, tip at (x, y). */
function pin(x: number, y: number, size: number, label: string, p: RoadPalette): string {
  return (
    `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(size / 38).toFixed(3)})">` +
    `<path d="M0 0C-4-9-14-15-14-25A14 14 0 1 1 14-25C14-15 4-9 0 0Z" fill="${p.accent}" stroke="${p.bg}" stroke-width="1.6"/>` +
    `<text x="0" y="-20.5" font-size="12.5" font-weight="700" fill="${p.onAccent}" text-anchor="middle" direction="rtl">${label}</text>` +
    `</g>`
  );
}

function doodle(kind: Doodle, x: number, y: number, size: number, p: RoadPalette, turn: number, lineArt = false): string {
  // in line art a shape is outlined and left paper-coloured instead of washed with the accent
  const wash = (op: number) => (lineArt ? `fill="${p.card}"` : `fill="${p.accent}" fill-opacity="${op}"`);
  const s = `stroke="${p.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const g = (inner: string) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(${(size / 40).toFixed(3)})">${inner}</g>`;
  switch (kind) {
    case 'heart':
      return g(`<path d="M0 14C-18 2-16-12-6-13C-2-13.5 0-10 0-8C0-10 2-13.5 6-13C16-12 18 2 0 14Z" ${wash(lineArt ? 0.75 : 0.85)} ${lineArt ? s : ''}/>`);
    case 'tree':
      return g(`<path d="M0-18L-11 2H11ZM0-6L-14 12H14Z" fill="${p.park}" ${s}/><path d="M0 12V19" fill="none" ${s}/>`);
    case 'star':
      return g(`<path d="M0-15L4-4L15-3L7 5L9 16L0 10L-9 16L-7 5L-15-3L-4-4Z" ${wash(0.6)} ${s}/>`);
    case 'sparkle':
      return g(`<path d="M0-16Q1.5-1.5 16 0Q1.5 1.5 0 16Q-1.5 1.5-16 0Q-1.5-1.5 0-16Z" fill="${lineArt ? p.accent : '#C9A45C'}"/>`);
    case 'leaf':
      return leafSprig(0, 0, 0, 1, false, g);
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
      ? { edge: '#E6D3A8', edgeOp: 0.7, edgeW: 24, sand: '#8A7552', sandOp: 0.5, sandW: 21.4, lane: '#F1E3BF', laneOp: 0.8, laneW: 1.8, dash: '7 8' }
      : { edge: '#B79A6C', edgeOp: 0.9, edgeW: 40, sand: '#F5E9CE', sandOp: 1, sandW: 36, lane: '#C2A678', laneOp: 0.6, laneW: 1.5, dash: '6 9' };
  const painted = !h.lineArt && !h.dark;
  // a painted road rests on the paper: a soft shadow under it, a dashed edge, a pale fill
  if (painted) body.push(`<path d="${road}" ${line} stroke="#7A5A34" stroke-opacity="0.2" stroke-width="46" transform="translate(0 5)" filter="url(#${id}-soft)"/>`);
  body.push(
    `<g filter="url(#${id}-paint)">` +
      `<path d="${road}" ${line} stroke="${look.edge}" stroke-opacity="${look.edgeOp}" stroke-width="${look.edgeW}"${painted ? ' stroke-dasharray="11 8"' : ''}/>` +
      `<path d="${road}" ${line} stroke="${look.sand}" stroke-opacity="${look.sandOp}" stroke-width="${look.sandW}"/>` +
      `<path d="${road}" ${line} stroke="${look.lane}" stroke-opacity="${look.laneOp}" stroke-width="${look.laneW}" stroke-dasharray="${look.dash}"/>` +
      `</g>`,
  );

  // doodles go where nothing else is: off the road, the pictures and the words
  const rnd = mulberry32(99 + stops.length);
  const track = sampleRoad(plan.road);
  const taken: Array<{ x: number; y: number; r: number }> = plan.stops.flatMap((s) => [
    { x: s.px, y: s.py, r: Math.max(s.boxW, s.boxH) / 2 },
    { x: s.x, y: (s.textY + s.bottom) / 2, r: 80 },
  ]);
  const free = (x: number, y: number, r: number) =>
    x > 80 && x < 820 && y > 300 && y < 1255 &&
    track.every((t) => Math.hypot(t.x - x, t.y - y) > 36 + r) &&
    taken.every((o) => Math.hypot(o.x - x, o.y - y) > o.r + r);
  // the line-art prints are full of small trees
  const kinds: Doodle[] = h.lineArt
    ? ['tree', 'tree', 'sparkle', 'tree', 'heart', 'tree', 'tree', 'flower', 'tree', 'star']
    : ['heart', 'sparkle', 'leaf', 'sparkle', 'heart', 'leaf', 'sparkle'];
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
  if (h.lineArt) place('compass', 58, 500);
  const budget = h.lineArt ? 30 + Math.max(0, 8 - stops.length) * 2 : 6 + Math.max(0, 8 - stops.length);
  for (let i = 0; i < budget; i++) place(kinds[i % kinds.length]!, 22 + rnd() * 14, 160);
  body.push(...placed);
  // a branch in two opposite corners, over the frame's ornaments, like leaves laid on the print
  if (!h.lineArt) {
    body.unshift(leafSprig(78, 82, 128, 2.1, !!h.dark), leafSprig(822, 1268, -52, 2.1, !!h.dark));
  }

  stops.forEach((m, i) => {
    const s = plan.stops[i]!;
    // long words shrink to the room they have, between the picture and the road's turn
    const room = plan.stops.length <= 4 ? 230 : 190;
    const line = h.digits([m.city, m.date].filter(Boolean).join(' · '));
    const cityFont = fitFont(m.city, 17, room);
    const cityHalf = (m.city.length * cityFont * 0.5) / 2 + 12;
    const dash = (side: 1 | -1) =>
      `<path d="M${n(s.x + side * cityHalf)} ${n(s.textY + 21)}h${side * 22}" stroke="${p.muted}" stroke-opacity="0.65" stroke-width="1.3" stroke-linecap="round"/>`;
    // the words sit on a halo of paper, so the road can pass behind them and they still read
    const words =
      `<g stroke="${p.bg}" stroke-width="8" stroke-linejoin="round" paint-order="stroke">` +
      [
        h.text(s.x, s.textY, fitFont(m.title, plan.compact ? 22 : 26, room), 700, p.ink, m.title),
        plan.compact
          ? h.text(s.x, s.textY + 24, fitFont(line, 15, room), 400, p.muted, line)
          : h.text(s.x, s.textY + 26, cityFont, 400, p.muted, m.city) + (m.city.trim() ? dash(1) + dash(-1) : ''),
        !plan.compact && m.date ? h.text(s.x, s.textY + 49, fitFont(h.digits(m.date), 16, room), 400, p.accent, h.digits(m.date)) : '',
      ].join('') +
      `</g>`;
    const pinMark = pin(s.x, s.textY - (plan.compact ? 22 : 28), plan.compact ? 34 : 44, h.digits(String(i + 1).padStart(2, '0')), p);
    // the picture is the cut-out itself, in its own shape; pen drawings are transparent lines, so
    // they get a patch of paper to hide the road behind them
    const fit = Math.min(s.boxW, s.boxH);
    const picture = m.art
      ? (h.lineArt ? `<ellipse cx="${n(s.px)}" cy="${n(s.py)}" rx="${n(s.boxW * 0.46)}" ry="${n(s.boxH * 0.46)}" fill="${p.bg}"/>` : '') +
        `<image href="${h.artImages?.[m.art] ?? artSrc(m.art, h.lineArt ? 'line' : 'color')}" x="${n(s.px - s.boxW / 2)}" y="${n(s.py - s.boxH / 2)}" width="${n(s.boxW)}" height="${n(s.boxH)}" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${n(s.px)}" cy="${n(s.py)}" r="${n(fit * 0.42)}" fill="${p.land}" fill-opacity="0.7"/>` +
        `<g filter="url(#${id}-wobble)" transform="translate(${n(s.px - fit * 0.4)} ${n(s.py - fit * 0.4)}) scale(${n((fit * 0.8) / 100 * 100) / 100})">${iconMarkup(m.icon ?? 'star', p)}</g>`;
    body.push(`<g transform="rotate(${n(s.tilt)} ${n(s.px)} ${n(s.py)})">${picture}</g>${words}${pinMark}`);
  });

  // the road's edges wander a little, and the painted ones get a fine grain, like watercolour on rough paper
  const grain = h.lineArt
    ? ''
    : `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="g"/>` +
      `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.43  0 0 0 0 0.31  0 0 0 0 0.2  0 0 0 0.9 -0.34" result="speck"/>` +
      `<feComposite in="speck" in2="d" operator="in" result="sp"/><feMerge><feMergeNode in="d"/><feMergeNode in="sp"/></feMerge>`;
  const defs =
    `<filter id="${id}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>` +
    `<filter id="${id}-wobble" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/></filter>` +
    `<filter id="${id}-paint" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="1350">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${h.lineArt ? 0.035 : 0.02}" numOctaves="3" seed="5" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="${h.lineArt ? 3.5 : 8}" result="d"/>` +
    (grain || `<feMerge><feMergeNode in="d"/></feMerge>`) +
    `</filter>`;
  return { defs, body: body.join('') };
}
