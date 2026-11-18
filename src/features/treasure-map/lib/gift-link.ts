import { packedGiftUrl, readGiftToken, unpackJson } from '../../poster/lib/gift-link.ts';
import { sanitizeMap, type SanitizedMap } from './sanitize.ts';

/** The treasure map as a link to the gift page; everything is in the fragment, nothing is stored. */
export function mapGiftUrl(origin: string, map: unknown): string {
  return packedGiftUrl(origin, 'map', map);
}

/** The map a gift link carries, repaired field by field; null when it carries none. */
export function readMapGift(hash: string): SanitizedMap | null {
  const found = readGiftToken(hash);
  return found?.product === 'map' ? sanitizeMap(unpackJson(found.token)) : null;
}
