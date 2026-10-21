import type { ConstellationArtImage } from '../lib/types.ts';

/**
 * Painted constellation figures, pinned to three stars each. Add an entry per
 * picture in `public/constellation-art/`; see the README there for the format
 * and for the licence the pictures must come with. A constellation listed here
 * is drawn from its picture instead of the built-in line figure.
 *
 * Example:
 *   {
 *     id: 'Ori',
 *     src: '/constellation-art/Ori.webp',
 *     width: 900,
 *     height: 900,
 *     // pixel in the picture  →  the star it sits on (J2000 RA, Dec in degrees)
 *     anchors: [
 *       { px: [612, 188], star: [88.79, 7.41] },   // Betelgeuse
 *       { px: [221, 760], star: [78.63, -8.2] },   // Rigel
 *       { px: [480, 460], star: [84.05, -1.2] },   // Alnilam
 *     ],
 *     opacity: 0.6,
 *   },
 */
export const ART_IMAGES: readonly ConstellationArtImage[] = [];
