import { memo } from 'react';
import {
  DEFAULT_SKY_LAYERS,
  resolveSkyLayers,
  type SkyLayers,
} from '../lib/layers';
import { PALETTES, type SkyChartVariant } from '../lib/palettes';
import type { PlanetId, SkySnapshot } from '../lib/types';
import { DEFAULT_PLANET_LABELS, SkyDrawing } from './SkyDrawing';

export type { SkyChartVariant };
export { DEFAULT_PLANET_LABELS };

/** Everything is drawn in a viewBox where the horizon circle has radius 100. */
const VIEW = 110;
export const DEFAULT_MAX_MAGNITUDE = DEFAULT_SKY_LAYERS.maxMagnitude;

export type SkyChartProps = {
  sky: SkySnapshot;
  variant?: SkyChartVariant;
  /**
   * Faintest star to draw. Naked-eye skies hold ~2,800 stars to magnitude 5.5,
   * which turns a small poster into noise; 4.6 keeps the recognisable shapes.
   */
  maxMagnitude?: number;
  /** Which parts of the sky to draw; anything left out takes its default. */
  layers?: Partial<SkyLayers>;
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
  maxMagnitude,
  planetLabels = DEFAULT_PLANET_LABELS,
  layers,
  className,
  ariaLabel = 'نقشه‌ی آسمان شب',
}: SkyChartProps) {
  const show = resolveSkyLayers(layers);

  return (
    <svg
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SkyDrawing
        sky={sky}
        palette={PALETTES[variant]}
        show={show}
        faintest={maxMagnitude ?? show.maxMagnitude}
        planetLabels={planetLabels}
      />
    </svg>
  );
}

export const SkyChart = memo(SkyChartBase);
