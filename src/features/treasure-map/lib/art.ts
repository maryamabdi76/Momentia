/**
 * Ready-made watercolour pictures for the illustrated road, as transparent WebP files in
 * `public/map-art`. A moment can use one of these instead of a drawn icon.
 */
export const MAP_ART = [
  'cafe',
  'love',
  'ring',
  'couple',
  'cake',
  'gift',
  'plane',
  'suitcase',
  'van',
  'beach',
  'mountain',
  'cabin',
  'home',
  'baby',
  'dog',
  'city',
  'camera',
  'concert',
  'graduate',
  'camp',
  'flag',
  'picnic',
  'balloons',
  'key',
  'trailmap',
  'compass',
  'globe',
  'letter',
  'plant',
  'cat',
  'coffee',
  'bouquet',
  'jar',
  'phone',
  'car',
  'signpost',
  'chest',
  'hotair',
  'boat',
  'sweater',
  'sneakers',
  'sunflowers',
  'family',
  'lock',
  'clapper',
  'photos',
  'teddy',
  'snowglobe',
  'tree',
  'lavender',
] as const;
export type MapArt = (typeof MAP_ART)[number];

/** The same pictures also come as black pen drawings, for the ink theme. */
export type ArtStyle = 'color' | 'line';

/** Where a picture is served from. */
export const artSrc = (id: MapArt, style: ArtStyle = 'color') => (style === 'line' ? `/map-art/line/${id}.webp` : `/map-art/${id}.webp`);
