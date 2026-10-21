import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSky, pinImage } from '../lib/compute.ts';
import { inlineArtImages } from '../../poster/lib/inline-images.ts';
import type { ConstellationArtImage, SkyCatalog } from '../lib/types.ts';

const close = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('pinImage carries each of the three pixels exactly onto its target', () => {
  const px = [[10, 20], [300, 40], [120, 500]] as const;
  const to = [[0.1, -0.4], [-0.3, 0.2], [0.5, 0.6]] as const;
  const [a, b, c, d, e, f] = pinImage(px, to)!;
  px.forEach(([u, v], i) => {
    close(a * u + c * v + e, to[i]![0]);
    close(b * u + d * v + f, to[i]![1]);
  });
});

test('pinImage refuses three pixels in a line', () => {
  assert.equal(pinImage([[0, 0], [1, 1], [2, 2]], [[0, 0], [1, 0], [0, 1]]), null);
});

const TEHRAN = { latitude: 35.69, longitude: 51.39 };
const YALDA = new Date('2026-12-21T17:30:00Z');
const image: ConstellationArtImage = {
  id: 'Ori',
  src: '/constellation-art/Ori.webp',
  width: 800,
  height: 800,
  anchors: [
    { px: [600, 150], star: [88.79, 7.41] },
    { px: [200, 700], star: [78.63, -8.2] },
    { px: [400, 450], star: [84.05, -1.2] },
  ],
};
const base: SkyCatalog = {
  stars: [],
  lines: [],
  art: [{ id: 'Ori', shapes: [{ closed: true, fill: true, points: [[84, 0], [85, 0], [85, 1]] }] }],
  images: [image],
};

test('a painted figure is pinned on the chart and replaces the drawn one', () => {
  const sky = computeSky({ ...TEHRAN, date: YALDA, catalog: base });
  assert.equal(sky.artImages.length, 1);
  assert.equal(sky.artImages[0]!.src, image.src);
  assert.equal(sky.art.find((f) => f.id === 'Ori'), undefined, 'the drawn Orion is skipped');
  // the picture's middle star lands where that star is on the chart
  const [a, b, c, d, e, f] = sky.artImages[0]!.matrix;
  const probe = computeSky({ ...TEHRAN, date: YALDA, catalog: { stars: [[84.05, -1.2, 1, 0]], lines: [] } }).stars[0]!;
  close(a * 400 + c * 450 + e, probe.x, 1e-6);
  close(b * 400 + d * 450 + f, probe.y, 1e-6);
});

test('a painted figure far under the horizon is left out', () => {
  const sky = computeSky({ ...TEHRAN, date: new Date('2026-06-21T17:30:00Z'), catalog: base });
  assert.equal(sky.artImages.length, 0);
});

test('inlineArtImages swaps picture URLs for data URIs and drops pictures that fail', async () => {
  const svg = '<g><image href="/constellation-art/A.webp" width="1"/><image href="/constellation-art/B.webp" width="1"/></g>';
  const out = await inlineArtImages(svg, async (url) => {
    if (url.endsWith('B.webp')) throw new Error('missing');
    return 'data:image/webp;base64,AAAA';
  });
  assert.equal(out, '<g><image href="data:image/webp;base64,AAAA" width="1"/></g>');
  assert.equal(await inlineArtImages('<g/>'), '<g/>');
});
