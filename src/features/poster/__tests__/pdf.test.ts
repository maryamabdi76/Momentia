import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPdf } from '../lib/pdf.ts';
import { formatColors } from '../lib/format-colors.ts';
import { POSTER_STYLES } from '../lib/themes.ts';
import { hexToRgb01 } from '../lib/export-formats.ts';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]);
const make = () =>
  buildPdf({
    widthPt: 595.28,
    heightPt: 841.89,
    background: [0.03, 0.07, 0.17],
    jpeg,
    imagePx: { width: 3000, height: 4500 },
    placement: { x: 22.68, y: 22.68, w: 531.6, h: 797.4 },
  });
const latin1 = (b: Uint8Array) => Array.from(b, (c) => String.fromCharCode(c)).join('');

test('the PDF has a header, an end marker and the JPEG bytes untouched', () => {
  const pdf = make();
  const text = latin1(pdf);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
  assert.ok(text.includes(latin1(jpeg)), 'the image stream is embedded as is');
  assert.ok(text.includes('/Filter /DCTDecode'));
});

test('every cross-reference offset points at its object', () => {
  const text = latin1(make());
  const table = text.slice(text.lastIndexOf('\nxref\n'));
  const entries = [...table.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
  assert.equal(entries.length, 6);
  entries.forEach((offset, i) => {
    assert.ok(text.startsWith(`${i + 1} 0 obj`, offset), `object ${i + 1} at ${offset}`);
  });
  const startxref = Number(/startxref\n(\d+)\n/.exec(text)![1]);
  assert.equal(text.slice(startxref, startxref + 4), 'xref');
});

test('the image is placed from the top-left, in PDF coordinates from the bottom', () => {
  const text = latin1(make());
  // y = page height − (top + height) = 841.89 − (22.68 + 797.4) = 21.81
  assert.ok(text.includes('531.6 0 0 797.4 22.68 21.81 cm /Im0 Do'), text.slice(0, 0));
});

test('every poster style gives a page colour the PDF can use', () => {
  for (const style of POSTER_STYLES) {
    const { paper, mat } = formatColors(style);
    assert.ok(hexToRgb01(paper), `${style} paper ${paper}`);
    assert.ok(hexToRgb01(mat), `${style} mat ${mat}`);
  }
});
