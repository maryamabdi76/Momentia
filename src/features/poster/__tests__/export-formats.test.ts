import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPORT_FORMATS,
  POSTER_ASPECT,
  fitPoster,
  formatGeometry,
  formatSpec,
  getExportFormat,
  hexToRgb01,
  isExportFormatId,
  pdfDpi,
  pdfLayout,
  rasterPlacement,
  type PdfFormat,
  type RasterFormat,
} from '../lib/export-formats.ts';

const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('every placement keeps the poster at 2:3 and inside its page', () => {
  for (const f of EXPORT_FORMATS) {
    const { x, y, w, h } =
      f.kind === 'raster' ? rasterPlacement(f) : pdfLayout(f).image;
    near(w / h, POSTER_ASPECT, 1e-6);
    const pageW = f.kind === 'raster' ? f.width : pdfLayout(f).widthPt;
    const pageH = f.kind === 'raster' ? f.height : pdfLayout(f).heightPt;
    assert.ok(x >= -1e-6 && y >= -1e-6, `${f.id} starts on the page`);
    assert.ok(x + w <= pageW + 1e-6 && y + h <= pageH + 1e-6, `${f.id} ends on the page`);
  }
});

test('the poster format is the whole 3000 × 4500 image', () => {
  const f = getExportFormat('poster') as RasterFormat;
  assert.deepEqual(rasterPlacement(f), { x: 0, y: 0, w: 3000, h: 4500 });
});

test('story and wallpaper keep the poster out of the app chrome', () => {
  for (const id of ['story', 'wallpaper'] as const) {
    const f = getExportFormat(id) as RasterFormat;
    const p = rasterPlacement(f);
    assert.ok(p.y >= f.height * f.safeTop - 1e-6, `${id}: below the top safe area`);
    assert.ok(p.y + p.h <= f.height * (1 - f.safeBottom) + 1e-6, `${id}: above the bottom safe area`);
    near(p.x + p.w / 2, f.width / 2); // centred sideways
  }
});

test('the 40 × 60 cm page is the poster edge to edge', () => {
  const l = pdfLayout(getExportFormat('print-40x60') as PdfFormat);
  near(l.image.x, 0);
  near(l.image.y, 0);
  near(l.image.w, l.widthPt);
  near(l.image.h, l.heightPt);
});

test('A4 and A3 are 595 × 842 and 842 × 1191 points', () => {
  const a4 = pdfLayout(getExportFormat('print-a4') as PdfFormat);
  const a3 = pdfLayout(getExportFormat('print-a3') as PdfFormat);
  near(a4.widthPt, 595.28);
  near(a4.heightPt, 841.89);
  near(a3.widthPt, 841.89);
  near(a3.heightPt, 1190.55);
});

test('print resolutions are good enough to hang on a wall', () => {
  const dpi = Object.fromEntries(
    EXPORT_FORMATS.filter((f): f is PdfFormat => f.kind === 'pdf').map((f) => [f.id, pdfDpi(f)]),
  );
  assert.ok(dpi['print-a4']! >= 300, 'A4');
  assert.ok(dpi['print-a3']! >= 250, 'A3');
  assert.ok(dpi['print-40x60']! >= 150, '40×60');
  assert.ok(dpi['print-50x70']! >= 150, '50×70');
});

test('fitPoster centres in the leftover space', () => {
  const b = fitPoster({ x: 10, y: 20, w: 1000, h: 300 });
  near(b.h, 300);
  near(b.w, 200);
  near(b.x, 10 + 400);
  near(b.y, 20);
});

test('format ids and hex colours are validated', () => {
  assert.equal(isExportFormatId('story'), true);
  assert.equal(isExportFormatId('print-a5'), false);
  assert.equal(isExportFormatId(undefined), false);
  assert.deepEqual(hexToRgb01('#ff0000'), [1, 0, 0]);
  assert.equal(hexToRgb01('rgba(1,2,3,0.4)'), null);
  assert.equal(hexToRgb01('#fff'), null);
});

test('the spec of each format states the sizes a buyer is shown', () => {
  const a4 = formatSpec(getExportFormat('print-a4'));
  assert.equal(a4.kind, 'pdf');
  if (a4.kind !== 'pdf') return;
  assert.deepEqual(a4.page, { w: 210, h: 297 });
  near(a4.poster.h, 281, 0.01); // 297 − 2 × 8 mm margin
  near(a4.poster.w, 281 * POSTER_ASPECT, 0.01);
  near(a4.gapY, 8, 0.01);
  near(a4.gapX, (210 - a4.poster.w) / 2, 0.01);
  assert.equal(a4.dpi, 407);

  const big = formatSpec(getExportFormat('print-40x60'));
  if (big.kind === 'pdf') {
    near(big.gapX, 0);
    near(big.gapY, 0);
    near(big.poster.w, 400, 0.01);
  }

  const story = formatSpec(getExportFormat('story'));
  assert.deepEqual(story.kind === 'raster' && story.page, { w: 1080, h: 1920 });
  assert.deepEqual(story.kind === 'raster' && story.poster, { w: 883, h: 1325 });
});

test('thumbnail geometry matches the placement', () => {
  const g = formatGeometry(getExportFormat('wallpaper'));
  assert.equal(g.pageW, 1290);
  assert.equal(g.pageH, 2796);
  near(g.poster.w / g.poster.h, POSTER_ASPECT, 1e-6);
});
