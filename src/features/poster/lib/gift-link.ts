import { parseDraft, type PosterDraft } from './draft.ts';

/**
 * A poster as a link: the whole draft is packed into the URL *fragment*
 * (`/gift#g=…`), which browsers never send to a server, so sharing a poster
 * keeps "nothing is stored on our side" true.
 */
const PARAM = 'g';

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function encodeGift(draft: PosterDraft): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(draft)));
}

export function decodeGift(token: string): PosterDraft | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(token));
    return parseDraft(JSON.parse(json));
  } catch {
    return null;
  }
}

export function giftUrl(origin: string, draft: PosterDraft): string {
  return `${origin}/gift#${PARAM}=${encodeGift(draft)}`;
}

/** Reads `location.hash` of the gift page; null when it has no usable poster. */
export function readGiftHash(hash: string): PosterDraft | null {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get(PARAM);
  return token ? decodeGift(token) : null;
}
