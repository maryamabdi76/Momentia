import { memo } from 'react';
import { resolveSkyLayers, type SkyLayers } from '../lib/layers';
import { PALETTES, type SkyChartVariant } from '../lib/palettes';
import type { PlanetId, SkySnapshot } from '../lib/types';
import { DEFAULT_PLANET_LABELS, SkyDrawing } from './SkyDrawing';

export type SkyFieldProps = {
  /** Compute it with `extendBelowHorizon` so the corners have stars too. */
  sky: SkySnapshot;
  variant?: SkyChartVariant;
  layers?: Partial<SkyLayers>;
  /** Size of the whole rectangle, in the units of its viewBox. */
  width: number;
  height: number;
  /** Where the zenith sits, and how many units the horizon circle's radius is. */
  centerX: number;
  centerY: number;
  radius: number;
  /** N/E/S/W words just outside the horizon ring; omit for none. */
  compass?: { north: string; south: string; east: string; west: string };
  compassColor?: string;
  /** A thin outline in this colour keeps the words readable over stars. */
  compassHalo?: string;
  compassSize?: number;
  planetLabels?: Record<PlanetId, string> | false;
  className?: string;
  ariaLabel?: string;
};

/**
 * The sky as a whole rectangle: the horizon circle sits inside it and the real
 * sky continues past the horizon (dimmer) out to the edges. Same orientation as
 * the circular chart: north up, east on the left. Presentation attributes only,
 * so it can be serialised into the exported file.
 */
function SkyFieldBase({
  sky,
  variant = 'gold',
  layers,
  width,
  height,
  centerX,
  centerY,
  radius,
  compass,
  compassColor = '#ffffff',
  compassHalo,
  compassSize = 24,
  planetLabels = DEFAULT_PLANET_LABELS,
  className,
  ariaLabel = 'نقشه‌ی آسمان شب',
}: SkyFieldProps) {
  const show = resolveSkyLayers(layers);
  const scale = radius / 100;

  const label = (text: string, x: number, y: number) => (
    <text
      x={x}
      y={y}
      fontSize={compassSize}
      fill={compassColor}
      textAnchor="middle"
      {...(compassHalo
        ? {
            stroke: compassHalo,
            strokeWidth: 6,
            strokeOpacity: 0.7,
            strokeLinejoin: 'round' as const,
            paintOrder: 'stroke' as const,
          }
        : {})}
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <g transform={`translate(${centerX} ${centerY}) scale(${scale})`}>
        <SkyDrawing
          sky={sky}
          palette={PALETTES[variant]}
          show={show}
          faintest={show.maxMagnitude}
          planetLabels={planetLabels}
          showBelow
        />
      </g>
      {compass && (
        <>
          {/* inside the ring: there is no margin outside it on a full-page sky */}
          {label(compass.north, centerX, centerY - radius + 44)}
          {label(compass.south, centerX, centerY + radius - 48)}
          {label(compass.east, centerX - radius + 44, centerY + 8)}
          {label(compass.west, centerX + radius - 44, centerY + 8)}
        </>
      )}
    </svg>
  );
}

export const SkyField = memo(SkyFieldBase);
