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

/** The poster image embedded in a PDF, in pixels; a landscape poster turns it on its side. */
export function pdfImageSize(aspect: number = POSTER_ASPECT): { width: number; height: number } {
  return aspect > 1
    ? { width: PDF_IMAGE_HEIGHT, height: PDF_IMAGE_WIDTH }
    : { width: PDF_IMAGE_WIDTH, height: PDF_IMAGE_HEIGHT };
}

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

/**
 * A landscape poster (aspect above 1) turns the formats that are shaped like the poster
 * (the plain image and the paper sizes) on their side. Phone formats stay portrait.
 */
export function orient(format: ExportFormat, aspect: number = POSTER_ASPECT): ExportFormat {
  if (aspect <= 1) return format;
  if (format.kind === 'raster') {
    return format.id === 'poster' ? { ...format, width: format.height, height: format.width } : format;
  }
  return { ...format, pageMm: [format.pageMm[1], format.pageMm[0]] };
}

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

/** The biggest box with the poster's ratio (2:3 unless told otherwise) that fits inside `area`, centred in it. */
export function fitPoster(area: Box, aspect: number = POSTER_ASPECT): Box {
  const w = Math.min(area.w, area.h * aspect);
  const h = w / aspect;
  return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h };
}

/** Where the poster goes on a raster canvas, in pixels from the top-left. */
export function rasterPlacement(raw: RasterFormat, aspect: number = POSTER_ASPECT): Box {
  const format = orient(raw, aspect) as RasterFormat;
  const sideX = format.width * format.side;
  const top = format.height * format.safeTop;
  return fitPoster(
    {
      x: sideX,
      y: top,
      w: format.width - 2 * sideX,
      h: format.height - top - format.height * format.safeBottom,
    },
    aspect,
  );
}

export type PdfLayout = {
  widthPt: number;
  heightPt: number;
  /** Placement of the poster in points, measured from the top-left of the page. */
  image: Box;
};

const mmToPt = (mm: number) => (mm / MM_PER_INCH) * PT_PER_INCH;

export function pdfLayout(raw: PdfFormat, aspect: number = POSTER_ASPECT): PdfLayout {
  const format = orient(raw, aspect) as PdfFormat;
  const [wMm, hMm] = format.pageMm;
  const m = format.marginMm;
  const image = fitPoster(
    {
      x: mmToPt(m),
      y: mmToPt(m),
      w: mmToPt(wMm - 2 * m),
      h: mmToPt(hMm - 2 * m),
    },
    aspect,
  );
  return { widthPt: mmToPt(wMm), heightPt: mmToPt(hMm), image };
}

/** Resolution of the embedded poster once printed on this page. */
export function pdfDpi(format: PdfFormat, aspect: number = POSTER_ASPECT): number {
  const { image } = pdfLayout(format, aspect);
  return Math.round(pdfImageSize(aspect).width / (image.w / PT_PER_INCH));
}

/** `#rrggbb` → [r, g, b] in 0…1, or null when it isn't a six-digit hex colour. */
export function hexToRgb01(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}

const MM_PER_PT = MM_PER_INCH / PT_PER_INCH;

/** Page and poster rectangles in one shared unit (pixels or points), for drawing a thumbnail. */
export function formatGeometry(
  raw: ExportFormat,
  aspect: number = POSTER_ASPECT,
): { pageW: number; pageH: number; poster: Box } {
  const format = orient(raw, aspect);
  if (format.kind === 'raster') {
    return { pageW: format.width, pageH: format.height, poster: rasterPlacement(raw as RasterFormat, aspect) };
  }
  const layout = pdfLayout(raw as PdfFormat, aspect);
  return { pageW: layout.widthPt, pageH: layout.heightPt, poster: layout.image };
}

/**
 * The page's width ÷ height, and where the poster sits on it as fractions (0…1) of
 * the page's width and height. This is what an on-screen preview needs to show
 * exactly the file that will be downloaded, at any size.
 */
export function formatFrame(format: ExportFormat, aspect: number = POSTER_ASPECT): {
  aspect: number;
  poster: { left: number; top: number; width: number; height: number };
} {
  const { pageW, pageH, poster } = formatGeometry(format, aspect);
  return {
    aspect: pageW / pageH,
    poster: {
      left: poster.x / pageW,
      top: poster.y / pageH,
      width: poster.w / pageW,
      height: poster.h / pageH,
    },
  };
}

/** What a person needs to know before choosing: every size, in its own unit. */
export type FormatSpec =
  | {
      kind: 'raster';
      /** The whole image, in pixels. */
      page: { w: number; h: number };
      /** The poster inside it, in pixels. */
      poster: { w: number; h: number };
    }
  | {
      kind: 'pdf';
      /** The sheet, in millimetres. */
      page: { w: number; h: number };
      /** The poster on the sheet, in millimetres. */
      poster: { w: number; h: number };
      /** White space on each side (left/right) and at the top and bottom, in millimetres. */
      gapX: number;
      gapY: number;
      dpi: number;
    };

export function formatSpec(raw: ExportFormat, aspect: number = POSTER_ASPECT): FormatSpec {
  const format = orient(raw, aspect);
  if (format.kind === 'raster') {
    const p = rasterPlacement(raw as RasterFormat, aspect);
    return {
      kind: 'raster',
      page: { w: format.width, h: format.height },
      poster: { w: Math.round(p.w), h: Math.round(p.h) },
    };
  }
  const { image } = pdfLayout(raw as PdfFormat, aspect);
  const poster = { w: image.w * MM_PER_PT, h: image.h * MM_PER_PT };
  const [pageW, pageH] = format.pageMm;
  return {
    kind: 'pdf',
    page: { w: pageW, h: pageH },
    poster,
    gapX: (pageW - poster.w) / 2,
    gapY: (pageH - poster.h) / 2,
    dpi: pdfDpi(raw as PdfFormat, aspect),
  };
}
