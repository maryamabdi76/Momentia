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
] as const;
export type MapArt = (typeof MAP_ART)[number];

/** Where a picture is served from. */
export const artSrc = (id: MapArt) => `/map-art/${id}.webp`;
