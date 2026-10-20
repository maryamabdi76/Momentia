import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeSky } from '../lib/compute.ts';
import { DEFAULT_SKY_LAYERS, resolveSkyLayers } from '../lib/layers.ts';
import type { SkyCatalog } from '../lib/types.ts';

const read = (name: string) =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const art = read('constellation-art.json').figures as NonNullable<SkyCatalog['art']>;
const catalog: SkyCatalog = {
  stars: read('stars.json').stars,
  lines: read('constellation-lines.json').lines,
  art,
};
const TEHRAN = { latitude: 35.69, longitude: 51.39 };
const YALDA = new Date('2026-12-21T17:30:00Z'); // 21:00 in Tehran

test('every figure belongs to a real constellation and has well-formed shapes', () => {
  const ids = new Set(catalog.lines.map((l) => l.id));
  assert.ok(art.length >= 6);
  for (const figure of art) {
    assert.ok(ids.has(figure.id), `${figure.id} is a constellation in the catalog`);
    assert.ok(figure.shapes.length > 0);
    for (const shape of figure.shapes) {
      assert.ok(shape.points.length >= 3, `${figure.id}: a shape has points`);
      for (const [ra, dec] of shape.points) {
        assert.ok(ra >= 0 && ra < 360 && dec >= -90 && dec <= 90, `${figure.id}: ${ra}, ${dec}`);
      }
    }
  }
});

test('on Yalda evening Orion is up in Tehran and its figure is returned in chart space', () => {
  const { art: drawn } = computeSky({ ...TEHRAN, date: YALDA, catalog });
  const orion = drawn.find((f) => f.id === 'Ori');
  assert.ok(orion, 'Orion figure present');
  assert.ok(orion.shapes.length > 3);
  // chart space: the horizon is the unit circle, so visible parts are near or inside it
  const inside = orion.shapes.flatMap((s) => s.points).filter(([x, y]) => Math.hypot(x, y) <= 1);
  assert.ok(inside.length > 100);
});

test('a figure that is wholly below the horizon is left out', () => {
  // Scorpius is far below the horizon on a December evening in Tehran
  const { art: drawn } = computeSky({ ...TEHRAN, date: YALDA, catalog });
  assert.equal(drawn.find((f) => f.id === 'Sco'), undefined);
});

test('without artwork in the catalog the snapshot has none, and the layer is on by default', () => {
  const plain = computeSky({ ...TEHRAN, date: YALDA, catalog: { ...catalog, art: undefined } });
  assert.deepEqual(plain.art, []);
  assert.equal(DEFAULT_SKY_LAYERS.constellationArt, true);
  // drafts saved before the option existed still resolve
  assert.equal(resolveSkyLayers({ maxMagnitude: 3.5 }).constellationArt, true);
});
