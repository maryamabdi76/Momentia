import type { SkyLayers } from '../lib/layers';
import type { Palette } from '../lib/palettes';
import type { PlanetId, SkyMoon, SkySnapshot } from '../lib/types';

/**
 * The drawing shared by the circular chart and the full-poster sky. Everything
 * is expressed in a unit where the horizon circle has radius 100, so each
 * caller just scales and positions the group.
 */
export const R = 100;

export const DEFAULT_PLANET_LABELS: Record<PlanetId, string> = {
  mercury: 'عطارد',
  venus: 'زهره',
  mars: 'مریخ',
  jupiter: 'مشتری',
  saturn: 'زحل',
};

export const starRadius = (mag: number) =>
  0.28 + 0.15 * Math.max(0, 6.2 - mag) ** 1.15;
const starOpacity = (mag: number) => (mag > 4.8 ? 0.72 : mag > 3.8 ? 0.88 : 1);
export const f = (n: number) => Number(n.toFixed(2));

/** Radius of a circle of constant altitude in the stereographic projection. */
export const altitudeRing = (altitude: number) =>
  R * Math.tan(((90 - altitude) * Math.PI) / 360);

export const toPath = (pieces: SkySnapshot['lines']) =>
  pieces
    .map((piece) =>
      piece.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x * R)} ${f(y * R)}`).join(''),
    )
    .join('');

export function Ticks({ color }: { color: string }) {
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

// A real Moon is only ~0.2 units wide on this chart; this is a deliberate, modest exaggeration.
const MOON_RADIUS = 2.6;

function Moon({ moon, color }: { moon: SkyMoon; color: string }) {
  const r = MOON_RADIUS;
  const cosPhase = 2 * moon.illumination - 1; // 1 full … −1 new
  const rx = r * Math.abs(cosPhase);
  const lit =
    moon.illumination > 0.985
      ? null
      : `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${f(rx)} ${r} 0 0 ${cosPhase > 0 ? 1 : 0} 0 ${-r}Z`;

  return (
    <g
      transform={`translate(${f(moon.x * R)} ${f(moon.y * R)}) rotate(${f(moon.brightLimbAngle)})`}
    >
      {/* the unlit part, barely there (earthshine) */}
      <circle r={r} fill={color} fillOpacity={0.14} />
      {moon.illumination > 0.012 &&
        (lit ? <path d={lit} fill={color} /> : <circle r={r} fill={color} />)}
    </g>
  );
}

/** Stars as one circle each. `fade` multiplies the opacity (used below the horizon). */
function Stars({
  stars,
  palette,
  faintest,
  fade = 1,
}: {
  stars: SkySnapshot['stars'];
  palette: Palette;
  faintest: number;
  fade?: number;
}) {
  return (
    <>
      {stars
        .filter((s) => s.mag <= faintest)
        .map((s, i) => (
          <circle
            key={i}
            cx={f(s.x * R)}
            cy={f(s.y * R)}
            r={f(starRadius(s.mag))}
            fill={palette.star(s.bv)}
            fillOpacity={f(starOpacity(s.mag) * fade)}
          />
        ))}
    </>
  );
}

const artPath = (shapes: SkySnapshot['art'][number]['shapes']) =>
  shapes
    .map(
      (shape) =>
        shape.points.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x * R)} ${f(y * R)}`).join('') +
        (shape.closed ? 'Z' : ''),
    )
    .join('');

const ART_INK_FILTER = 'sky-art-ink';

/**
 * Painted figures, each pinned to its stars by a matrix (chart units → ×R here).
 * On light papers (`palette.artInk`) they are redrawn in ink: a flood of the ink
 * colour, kept only where the painting has any opacity.
 */
function ArtImages({
  images,
  palette,
}: {
  images: SkySnapshot['artImages'];
  palette: Palette;
}) {
  const ink = palette.artInk;
  return (
    <g>
      {ink && (
        <defs>
          <filter
            id={ART_INK_FILTER}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodColor={ink} result="ink" />
            <feComposite in="ink" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      )}
      {images.map(({ id, src, width, height, matrix, opacity }) => {
        const [a, b, c, d, e, g] = matrix.map((n) => Number((n * R).toFixed(5)));
        return (
          <image
            key={id}
            href={src}
            width={width}
            height={height}
            opacity={Math.min(1, opacity * palette.artBoost)}
            filter={ink ? `url(#${ART_INK_FILTER})` : undefined}
            transform={`matrix(${a} ${b} ${c} ${d} ${e} ${g})`}
            preserveAspectRatio="none"
          />
        );
      })}
    </g>
  );
}

/**
 * Figures drawn around the constellations. The soft silhouette is one group, so
 * where a limb overlaps the body the fill does not double up; a thin outline
 * sits on top.
 */
function ConstellationArt({ art, palette }: { art: SkySnapshot['art']; palette: Palette }) {
  return (
    <g>
      {art.map(({ id, shapes }) => (
        <g key={id}>
          <g opacity={0.13} fill={palette.figure}>
            {shapes
              .filter((s) => s.fill)
              .map((s, i) => (
                <path key={i} d={artPath([s])} />
              ))}
          </g>
          <path
            d={artPath(shapes)}
            fill="none"
            stroke={palette.figure}
            strokeOpacity={f(Math.min(1, palette.figureOpacity * 0.75))}
            strokeWidth={0.26}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </g>
  );
}

/**
 * How much quieter the sky under the horizon is drawn. Enough that the visible
 * sky is still the subject, not so much that the page stops looking like sky.
 */
const BELOW_STAR_FADE = 0.7;
const BELOW_LINE_FADE = 0.8;
/** With the sky continuing past it, the horizon ring and ticks recede. */
const FIELD_RING_OPACITY = 0.5;

export type SkyDrawingProps = {
  sky: SkySnapshot;
  palette: Palette;
  show: SkyLayers;
  faintest: number;
  planetLabels: Record<PlanetId, string> | false;
  /** Draw `sky.below` (when present) around the horizon circle, dimmed. */
  showBelow?: boolean;
};

/** The sky itself, in horizon-radius-100 units. Does not draw the horizon ring. */
export function SkyDrawing({
  sky,
  palette: p,
  show,
  faintest,
  planetLabels,
  showBelow = false,
}: SkyDrawingProps) {
  const below = showBelow ? sky.below : undefined;

  return (
    <>
      <defs>
        <clipPath id="sky-horizon">
          <circle r={R} />
        </clipPath>
      </defs>

      {/* the sky under the horizon: unclipped, quieter */}
      {below && (
        <g>
          {show.constellationLines && (
            <path
              d={toPath(below.lines)}
              fill="none"
              stroke={p.figure}
              strokeOpacity={f(p.figureOpacity * BELOW_LINE_FADE)}
              strokeWidth={0.32}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <Stars
            stars={below.stars}
            palette={p}
            faintest={faintest}
            fade={BELOW_STAR_FADE}
          />
        </g>
      )}

      {/* altitude rings at 30° and 60° */}
      {[30, 60].map((alt) => (
        <circle
          key={alt}
          r={f(altitudeRing(alt))}
          fill="none"
          stroke={p.ringSoft}
          strokeOpacity={0.16}
          strokeWidth={0.3}
        />
      ))}

      <g clipPath="url(#sky-horizon)">
        {show.equator && (
          <path
            d={toPath(sky.guides.equator)}
            fill="none"
            stroke={p.guide}
            strokeOpacity={0.5}
            strokeWidth={0.3}
            strokeDasharray="0.6 1.4"
            strokeLinecap="round"
          />
        )}
        {show.ecliptic && (
          <path
            d={toPath(sky.guides.ecliptic)}
            fill="none"
            stroke={p.guide}
            strokeOpacity={0.7}
            strokeWidth={0.35}
            strokeDasharray="3 1.6"
          />
        )}

        {show.constellationArt && (
          <>
            <ConstellationArt art={sky.art} palette={p} />
            <ArtImages images={sky.artImages} palette={p} />
          </>
        )}

        {show.constellationLines && (
          <path
            d={toPath(sky.lines)}
            fill="none"
            stroke={p.figure}
            strokeOpacity={p.figureOpacity}
            strokeWidth={0.32}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        <Stars stars={sky.stars} palette={p} faintest={faintest} />

        {show.moonAndPlanets &&
          sky.planets.map((pl) => {
            const x = pl.x * R;
            const y = pl.y * R;
            const r = Math.max(0.9, starRadius(pl.mag));
            return (
              <g key={pl.id}>
                <circle
                  cx={f(x)}
                  cy={f(y)}
                  r={f(r + 1.6)}
                  fill="none"
                  stroke={p.planet}
                  strokeOpacity={0.55}
                  strokeWidth={0.3}
                />
                <circle cx={f(x)} cy={f(y)} r={f(r)} fill={p.planet} />
                {planetLabels && show.planetNames && (
                  <text
                    x={f(x)}
                    y={f(y + r + 6.4)}
                    textAnchor="middle"
                    fontSize={3.4}
                    fill={p.label}
                    fillOpacity={0.9}
                  >
                    {planetLabels[pl.id]}
                  </text>
                )}
              </g>
            );
          })}

        {show.moonAndPlanets && sky.moon.visible && (
          <Moon moon={sky.moon} color={p.moon} />
        )}
      </g>

      <g opacity={below ? FIELD_RING_OPACITY : 1}>
        <circle r={R} fill="none" stroke={p.ring} strokeWidth={0.6} />
        <Ticks color={p.ring} />
      </g>
    </>
  );
}
