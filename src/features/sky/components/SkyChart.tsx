import { memo } from 'react';
import type { PlanetId, SkyMoon, SkySnapshot } from '../lib/types';

export type SkyChartVariant = 'gold' | 'mono';

export const DEFAULT_PLANET_LABELS: Record<PlanetId, string> = {
  mercury: 'عطارد',
  venus: 'زهره',
  mars: 'مریخ',
  jupiter: 'مشتری',
  saturn: 'زحل',
};

type Palette = {
  ring: string;
  ringSoft: string;
  figure: string;
  figureOpacity: number;
  star: (bv: number) => string;
  moon: string;
  planet: string;
  label: string;
};

type RGB = [number, number, number];
const lerp = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const hex = ([r, g, b]: RGB) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

// B−V colour index → a gentle tint: blue-white, white, cream, amber.
const BLUE: RGB = [214, 226, 255];
const WHITE: RGB = [255, 248, 235];
const AMBER: RGB = [255, 230, 190];
const ORANGE: RGB = [255, 206, 158];
function warmStar(bv: number): string {
  if (bv <= 0) return hex(BLUE);
  if (bv < 0.6) return hex(lerp(BLUE, WHITE, bv / 0.6));
  if (bv < 1.2) return hex(lerp(WHITE, AMBER, (bv - 0.6) / 0.6));
  return hex(lerp(AMBER, ORANGE, Math.min(1, (bv - 1.2) / 0.5)));
}

const PALETTES: Record<SkyChartVariant, Palette> = {
  gold: {
    ring: '#CEB47B',
    ringSoft: '#CEB47B',
    figure: '#CEB47B',
    figureOpacity: 0.6,
    star: warmStar,
    moon: '#EAD9AA',
    planet: '#FFD9A0',
    label: '#E8D9B8',
  },
  mono: {
    ring: '#2a2a28',
    ringSoft: '#2a2a28',
    figure: '#2a2a28',
    figureOpacity: 0.42,
    star: () => '#1c1c1a',
    moon: '#1c1c1a',
    planet: '#1c1c1a',
    label: '#2a2a28',
  },
};

/** Everything is drawn in a viewBox where the horizon circle has radius 100. */
const R = 100;
const VIEW = 110;

const starRadius = (mag: number) => 0.28 + 0.15 * Math.max(0, 6.2 - mag) ** 1.15;
const starOpacity = (mag: number) => (mag > 4.8 ? 0.72 : mag > 3.8 ? 0.88 : 1);
const f = (n: number) => Number(n.toFixed(2));
/** Radius of a circle of constant altitude in the stereographic projection. */
const altitudeRing = (altitude: number) => R * Math.tan(((90 - altitude) * Math.PI) / 360);

function Ticks({ color }: { color: string }) {
  const marks = [];
  for (let i = 0; i < 72; i++) {
    const az = (i * 5 * Math.PI) / 180;
    const len = i === 0 ? 5 : i % 3 === 0 ? 3.2 : 1.8;
    const dx = -Math.sin(az);
    const dy = -Math.cos(az);
    marks.push(
      <line
        key={i}
        x1={f(dx * R)}
        y1={f(dy * R)}
        x2={f(dx * (R + len))}
        y2={f(dy * (R + len))}
        stroke={color}
        strokeWidth={i % 3 === 0 ? 0.5 : 0.3}
        strokeOpacity={0.75}
      />,
    );
  }
  return <g>{marks}</g>;
}

const MOON_RADIUS = 4.4;

function Moon({ moon, color }: { moon: SkyMoon; color: string }) {
  const r = MOON_RADIUS;
  const cosPhase = 2 * moon.illumination - 1; // 1 full … −1 new
  const rx = r * Math.abs(cosPhase);
  const lit =
    moon.illumination > 0.985
      ? null
      : `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${f(rx)} ${r} 0 0 ${cosPhase > 0 ? 1 : 0} 0 ${-r}Z`;

  return (
    <g transform={`translate(${f(moon.x * R)} ${f(moon.y * R)}) rotate(${f(moon.brightLimbAngle)})`}>
      {/* the unlit part, barely there (earthshine) */}
      <circle r={r} fill={color} fillOpacity={0.14} />
      {moon.illumination > 0.012 &&
        (lit ? <path d={lit} fill={color} /> : <circle r={r} fill={color} />)}
    </g>
  );
}

export type SkyChartProps = {
  sky: SkySnapshot;
  variant?: SkyChartVariant;
  /** Persian names next to the planets; pass `false` to leave them unlabelled. */
  planetLabels?: Record<PlanetId, string> | false;
  className?: string;
  ariaLabel?: string;
};

/**
 * The sky as a circular chart: zenith in the middle, horizon on the rim, north
 * up and east on the left. Pure SVG with presentation attributes only (no CSS
 * classes), so the same markup can be serialised and exported as a file.
 */
function SkyChartBase({
  sky,
  variant = 'gold',
  planetLabels = DEFAULT_PLANET_LABELS,
  className,
  ariaLabel = 'نقشه‌ی آسمان شب',
}: SkyChartProps) {
  const p = PALETTES[variant];

  const figures = sky.lines
    .map((piece) => piece.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x * R)} ${f(y * R)}`).join(''))
    .join('');

  return (
    <svg
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="sky-horizon">
          <circle r={R} />
        </clipPath>
      </defs>

      {/* altitude rings at 30° and 60° */}
      {[30, 60].map((alt) => (
        <circle key={alt} r={f(altitudeRing(alt))} fill="none" stroke={p.ringSoft} strokeOpacity={0.16} strokeWidth={0.3} />
      ))}

      <g clipPath="url(#sky-horizon)">
        <path d={figures} fill="none" stroke={p.figure} strokeOpacity={p.figureOpacity} strokeWidth={0.36} strokeLinecap="round" strokeLinejoin="round" />

        {sky.stars.map((s, i) => (
          <circle
            key={i}
            cx={f(s.x * R)}
            cy={f(s.y * R)}
            r={f(starRadius(s.mag))}
            fill={p.star(s.bv)}
            fillOpacity={starOpacity(s.mag)}
          />
        ))}

        {sky.planets.map((pl) => {
          const x = pl.x * R;
          const y = pl.y * R;
          const r = Math.max(0.9, starRadius(pl.mag));
          return (
            <g key={pl.id}>
              <circle cx={f(x)} cy={f(y)} r={f(r + 1.6)} fill="none" stroke={p.planet} strokeOpacity={0.55} strokeWidth={0.3} />
              <circle cx={f(x)} cy={f(y)} r={f(r)} fill={p.planet} />
              {planetLabels && (
                <text x={f(x)} y={f(y + r + 6.4)} textAnchor="middle" fontSize={3.4} fill={p.label} fillOpacity={0.9}>
                  {planetLabels[pl.id]}
                </text>
              )}
            </g>
          );
        })}

        {sky.moon.visible && <Moon moon={sky.moon} color={p.moon} />}
      </g>

      <circle r={R} fill="none" stroke={p.ring} strokeWidth={0.6} />
      <Ticks color={p.ring} />
    </svg>
  );
}

export const SkyChart = memo(SkyChartBase);
