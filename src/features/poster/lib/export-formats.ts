/**
 * The files a paid download can be: the poster as an image, as a phone story or
 * wallpaper, or as a PDF page in a paper size. Pure numbers and geometry, so the
 * layout can be tested without a browser.
 *
 * The poster itself is always 2:3 (900 × 1350). Every other format places that
 * same poster inside a bigger page and fills the rest with a flat colour.
 */
export const POSTER_ASPECT = 900 / 1350;

/** Width of the poster image embedded in PDFs (the same 3000 × 4500 as the PNG). */
export const PDF_IMAGE_WIDTH = 3000;
export const PDF_IMAGE_HEIGHT = 4500;

const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;

export type Box = { x: number; y: number; w: number; h: number };

export type RasterFormat = {
  kind: 'raster';
  id: 'poster' | 'story' | 'wallpaper';
  width: number;
  height: number;
  /** Space kept clear of the poster, as fractions of the height (app chrome, clock, controls). */
  safeTop: number;
  safeBottom: number;
  /** Space kept clear on each side, as a fraction of the width. */
  side: number;
  /** Fill colour behind the poster: the page edge (`paper`) or the card backdrop (`mat`). */
  backdrop: 'paper' | 'mat';
  extension: 'png';
};

export type PdfFormat = {
  kind: 'pdf';
  id: 'print-a4' | 'print-a3' | 'print-40x60' | 'print-50x70';
  /** Page size in millimetres, portrait. */
  pageMm: readonly [number, number];
  /** White space kept around the poster, in millimetres. */
  marginMm: number;
  extension: 'pdf';
};

export type ExportFormat = RasterFormat | PdfFormat;
export type ExportFormatId = ExportFormat['id'];

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  {
    kind: 'raster',
    id: 'poster',
    width: 3000,
    height: 4500,
    safeTop: 0,
    safeBottom: 0,
    side: 0,
    backdrop: 'paper',
    extension: 'png',
  },
  {
    // Instagram / Telegram story, 9:16. The app draws over the top ~13% and bottom ~18%.
    kind: 'raster',
    id: 'story',
    width: 1080,
    height: 1920,
    safeTop: 0.13,
    safeBottom: 0.18,
    side: 0.06,
    backdrop: 'mat',
    extension: 'png',
  },
  {
    // Phone lock screen: the clock takes the top ~30%, the flashlight and camera the bottom ~12%.
    kind: 'raster',
    id: 'wallpaper',
    width: 1290,
    height: 2796,
    safeTop: 0.3,
    safeBottom: 0.12,
    side: 0.06,
    backdrop: 'mat',
    extension: 'png',
  },
  { kind: 'pdf', id: 'print-a4', pageMm: [210, 297], marginMm: 8, extension: 'pdf' },
  { kind: 'pdf', id: 'print-a3', pageMm: [297, 420], marginMm: 10, extension: 'pdf' },
  // exactly 2:3, so the poster fills the page edge to edge
  { kind: 'pdf', id: 'print-40x60', pageMm: [400, 600], marginMm: 0, extension: 'pdf' },
  { kind: 'pdf', id: 'print-50x70', pageMm: [500, 700], marginMm: 10, extension: 'pdf' },
];

export const DEFAULT_FORMAT_ID: ExportFormatId = 'poster';

export function isExportFormatId(value: unknown): value is ExportFormatId {
  return EXPORT_FORMATS.some((f) => f.id === value);
}

export function getExportFormat(id: ExportFormatId): ExportFormat {
  const format = EXPORT_FORMATS.find((f) => f.id === id);
  if (!format) throw new Error(`unknown export format: ${id}`);
  return format;
}

/** The biggest box with the poster's 2:3 ratio that fits inside `area`, centred in it. */
export function fitPoster(area: Box): Box {
  const w = Math.min(area.w, area.h * POSTER_ASPECT);
  const h = w / POSTER_ASPECT;
  return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h };
}

/** Where the poster goes on a raster canvas, in pixels from the top-left. */
export function rasterPlacement(format: RasterFormat): Box {
  const sideX = format.width * format.side;
  const top = format.height * format.safeTop;
  return fitPoster({
    x: sideX,
    y: top,
    w: format.width - 2 * sideX,
    h: format.height - top - format.height * format.safeBottom,
  });
}

export type PdfLayout = {
  widthPt: number;
  heightPt: number;
  /** Placement of the poster in points, measured from the top-left of the page. */
  image: Box;
};

const mmToPt = (mm: number) => (mm / MM_PER_INCH) * PT_PER_INCH;

export function pdfLayout(format: PdfFormat): PdfLayout {
  const [wMm, hMm] = format.pageMm;
  const m = format.marginMm;
  const image = fitPoster({
    x: mmToPt(m),
    y: mmToPt(m),
    w: mmToPt(wMm - 2 * m),
    h: mmToPt(hMm - 2 * m),
  });
  return { widthPt: mmToPt(wMm), heightPt: mmToPt(hMm), image };
}

/** Resolution of the embedded poster once printed on this page. */
export function pdfDpi(format: PdfFormat): number {
  const { image } = pdfLayout(format);
  return Math.round(PDF_IMAGE_WIDTH / (image.w / PT_PER_INCH));
}

/** `#rrggbb` → [r, g, b] in 0…1, or null when it isn't a six-digit hex colour. */
export function hexToRgb01(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}
