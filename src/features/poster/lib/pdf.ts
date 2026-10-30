import type { Box } from './export-formats.ts';

/**
 * A one-page PDF holding a single JPEG on a flat background. Written by hand
 * (a PDF is just numbered objects plus a table of byte offsets), so no library
 * has to be shipped to the browser.
 */
export type PdfOptions = {
  widthPt: number;
  heightPt: number;
  /** Page colour, each channel 0…1. */
  background: readonly [number, number, number];
  jpeg: Uint8Array;
  imagePx: { width: number; height: number };
  /** Where the image goes, in points from the top-left of the page. */
  placement: Box;
};

const num = (n: number) => String(Math.round(n * 1000) / 1000);

const latin1 = (text: string) => {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0xff;
  return out;
};

export function buildPdf(opts: PdfOptions): Uint8Array {
  const { widthPt: W, heightPt: H, background, jpeg, imagePx, placement } = opts;
  const [r, g, b] = background;
  // PDF's origin is the bottom-left corner; ours is the top-left
  const y = H - (placement.y + placement.h);

  const content =
    `q ${num(r)} ${num(g)} ${num(b)} rg 0 0 ${num(W)} ${num(H)} re f Q\n` +
    `q ${num(placement.w)} 0 0 ${num(placement.h)} ${num(placement.x)} ${num(y)} cm /Im0 Do Q\n`;

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };
  const text = (s: string) => push(latin1(s));
  const object = (n: number, head: string, stream?: Uint8Array) => {
    offsets[n] = length;
    text(`${n} 0 obj\n${head}\n`);
    if (stream) {
      text('stream\n');
      push(stream);
      text('\nendstream\n');
    }
    text('endobj\n');
  };

  text('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(W)} ${num(H)}] ` +
      '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
  );
  object(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${imagePx.width} /Height ${imagePx.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
    jpeg,
  );
  const contentBytes = latin1(content);
  object(5, `<< /Length ${contentBytes.length} >>`, contentBytes);
  object(6, '<< /Title (Momentia poster) /Producer (Momentia) >>');

  const xrefAt = length;
  const count = offsets.length; // objects 1…6 plus the free entry 0
  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let n = 1; n < count; n++) xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${count} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  text(xref);

  const out = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}
