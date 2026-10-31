import {
  PDF_IMAGE_HEIGHT,
  PDF_IMAGE_WIDTH,
  getExportFormat,
  hexToRgb01,
  pdfLayout,
  rasterPlacement,
  type ExportFormatId,
} from './export-formats.ts';
import { buildPdf } from './pdf.ts';

/** Flat colours behind the poster, taken from the poster's style. */
export type FormatColors = {
  /** The colour at the poster's edge: used where the page continues the paper. */
  paper: string;
  /** The backdrop colour used for story and wallpaper. */
  mat: string;
};

async function loadSvg(svg: string): Promise<{ img: HTMLImageElement; dispose: () => void }> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image();
  img.src = url;
  await img.decode();
  return { img, dispose: () => URL.revokeObjectURL(url) };
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  return { canvas, ctx };
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), type, quality),
  );

/**
 * Fills the canvas, then draws the poster into `box`. Some browsers resolve the
 * SVG's embedded fonts a frame late, so the first draw is thrown away.
 */
async function paint(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: { width: number; height: number },
  fill: string,
  box: { x: number; y: number; w: number; h: number },
) {
  const draw = () => {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
  };
  draw();
  await new Promise((r) => setTimeout(r, 60));
  draw();
}

/** A PNG of the poster on a story or wallpaper canvas. */
async function renderRaster(
  svg: string,
  id: 'poster' | 'story' | 'wallpaper',
  colors: FormatColors,
): Promise<Blob> {
  const format = getExportFormat(id);
  if (format.kind !== 'raster') throw new Error(`${id} is not an image format`);
  const { img, dispose } = await loadSvg(svg);
  try {
    const { canvas, ctx } = makeCanvas(format.width, format.height);
    const fill = format.backdrop === 'mat' ? colors.mat : colors.paper;
    await paint(ctx, img, format, fill, rasterPlacement(format));
    return await toBlob(canvas, 'image/png');
  } finally {
    dispose();
  }
}

/** A one-page PDF in a paper size, the poster centred on a page of the paper colour. */
async function renderPdf(svg: string, id: ExportFormatId, colors: FormatColors): Promise<Blob> {
  const format = getExportFormat(id);
  if (format.kind !== 'pdf') throw new Error(`${id} is not a PDF format`);
  const background = hexToRgb01(colors.paper);
  if (!background) throw new Error(`paper colour is not #rrggbb: ${colors.paper}`);

  const { img, dispose } = await loadSvg(svg);
  try {
    const size = { width: PDF_IMAGE_WIDTH, height: PDF_IMAGE_HEIGHT };
    const { canvas, ctx } = makeCanvas(size.width, size.height);
    await paint(ctx, img, size, colors.paper, { x: 0, y: 0, w: size.width, h: size.height });
    const jpeg = await toBlob(canvas, 'image/jpeg', 0.93);
    const layout = pdfLayout(format);
    const pdf = buildPdf({
      widthPt: layout.widthPt,
      heightPt: layout.heightPt,
      background,
      jpeg: new Uint8Array(await jpeg.arrayBuffer()),
      imagePx: size,
      placement: layout.image,
    });
    return new Blob([pdf as BlobPart], { type: 'application/pdf' });
  } finally {
    dispose();
  }
}

/** The file for one of the paid formats, built from the poster's SVG (no watermark). */
export function renderFormat(
  svg: string,
  id: Exclude<ExportFormatId, 'poster'>,
  colors: FormatColors,
): Promise<Blob> {
  return id === 'story' || id === 'wallpaper'
    ? renderRaster(svg, id, colors)
    : renderPdf(svg, id, colors);
}
