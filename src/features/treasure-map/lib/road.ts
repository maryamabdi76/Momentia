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

/** Where the stops go: they alternate sides of a winding road, the first at the right. */
export function roadStops(count: number): Array<{ x: number; y: number; blockX: number }> {
  const centre = 752;
  // a few moments spread out to fill the sheet; many are packed to fit above the foot of the page
  const step = count > 1 ? Math.min(count <= 4 ? 230 : 150, 800 / (count - 1)) : 0;
  const span = step * (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const right = i % 2 === 0;
    return {
      // the road swings to the side opposite the picture, so each stop has room
      x: 450 + (right ? -80 : 80),
      y: centre - span / 2 + i * step,
      blockX: right ? 705 : 195,
    };
  });
}

/**
 * The illustrated road: a winding road across the sheet, a numbered stop for each moment, and beside
 * each stop its picture with the caption, place and date. Returns the markup and the filter it needs.
 */
export function roadSvg(stops: RoadStop[], p: RoadPalette, id: string, h: Helpers): { defs: string; body: string } {
  const n = h.num;
  const slots = roadStops(stops.length);
  const body: string[] = [];

  const first = slots[0]!;
  const last = slots[slots.length - 1]!;
  // the road runs in from the top and out to the foot, leaning the way it bends
  const through: Point[] = [
    { x: (first.x + 450) / 2, y: first.y - 70 },
    ...slots.map((s) => ({ x: s.x, y: s.y })),
    { x: (last.x + 450) / 2, y: Math.min(last.y + 80, 1230) },
  ];
  const road = smoothOpenPath(through);
  body.push(
    `<path d="${road}" fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="${road}" fill="none" stroke="${p.card}" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="${road}" fill="none" stroke="${p.ink}" stroke-opacity="0.45" stroke-width="2.4" stroke-dasharray="9 11" stroke-linecap="round"/>`,
  );

  stops.forEach((m, i) => {
    const s = slots[i]!;
    const dir = s.blockX > s.x ? 1 : -1;
    const iconY = s.y - 8;
    // a dotted line from the road to its picture
    body.push(
      `<path d="M${n(s.x + dir * 22)} ${n(s.y)}L${n(s.blockX - dir * 58)} ${n(iconY)}" fill="none" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="2.2" stroke-dasharray="1 8" stroke-linecap="round"/>`,
    );
    // the picture, on a soft round patch of paper
    body.push(
      `<circle cx="${n(s.blockX)}" cy="${n(iconY)}" r="56" fill="${p.land}" fill-opacity="0.75"/>`,
      `<g filter="url(#${id}-wobble)" transform="translate(${n(s.blockX - 46)} ${n(iconY - 46)}) scale(0.92)">${iconMarkup(m.icon ?? 'star', p)}</g>`,
    );
    // the number, on the road
    body.push(
      `<circle cx="${n(s.x)}" cy="${n(s.y)}" r="20" fill="${p.accent}" stroke="${p.card}" stroke-width="3.5"/>`,
      h.text(s.x, s.y + 7, 20, 700, p.onAccent, h.digits(String(i + 1))),
    );
    // the words
    body.push(h.text(s.blockX, s.y + 68, 24, 700, p.ink, m.title));
    body.push(h.text(s.blockX, s.y + 94, 17, 400, p.muted, m.city));
    if (m.date) body.push(h.text(s.blockX, s.y + 117, 16, 400, p.accent, h.digits(m.date)));
  });

  const defs =
    `<filter id="${id}-wobble" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/></filter>`;
  return { defs, body: body.join('') };
}
