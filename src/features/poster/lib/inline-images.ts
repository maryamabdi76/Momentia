/**
 * A downloaded poster is an SVG drawn from a blob, and an SVG loaded that way
 * cannot fetch pictures by URL. This swaps every image the chart points at for
 * the picture itself (a data URI), so the file is complete on its own.
 */
const ART_HREF = /href="(\/constellation-art\/[^"]+)"/g;

export type LoadImage = (url: string) => Promise<string>;

/** Fetches `url` and returns it as a data URI. */
export const loadAsDataUri: LoadImage = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const blob = await res.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${blob.type || 'image/webp'};base64,${btoa(bin)}`;
};

/** A picture that cannot be loaded is left out rather than breaking the whole poster. */
export async function inlineArtImages(svg: string, load: LoadImage = loadAsDataUri): Promise<string> {
  const urls = [...new Set([...svg.matchAll(ART_HREF)].map((m) => m[1]!))];
  if (urls.length === 0) return svg;
  const loaded = new Map<string, string | null>(
    await Promise.all(
      urls.map(async (url): Promise<[string, string | null]> => [url, await load(url).catch(() => null)]),
    ),
  );
  let out = svg;
  for (const [url, data] of loaded) {
    if (data) {
      out = out.split(`href="${url}"`).join(`href="${data}"`);
    } else {
      // drop the whole <image …/> element
      out = out.replace(new RegExp(`<image[^>]*href="${url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*/?>(</image>)?`, 'g'), '');
    }
  }
  return out;
}
