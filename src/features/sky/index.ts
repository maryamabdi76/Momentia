/**
 * Sky calculation and SVG rendering.
 *
 *   computeSky()  – where every star, the Moon and the planets are, for a place and instant
 *   <SkyChart/>   – draws that as a circular chart
 *
 * The star catalog lives in `./catalog` and is imported separately on purpose.
 */
export { computeSky, sunAltitude } from './lib/compute';
export { SkyChart, DEFAULT_PLANET_LABELS } from './components/SkyChart';
export type { SkyChartProps, SkyChartVariant } from './components/SkyChart';
export {
  DEFAULT_SKY_LAYERS,
  MAGNITUDE_PRESETS,
  resolveSkyLayers,
} from './lib/layers';
export type { SkyLayers } from './lib/layers';
export type {
  PlanetId,
  SkyCatalog,
  SkyMoon,
  SkyPlanet,
  SkySnapshot,
  SkyStar,
} from './lib/types';
