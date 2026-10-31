import test from 'node:test';
import assert from 'node:assert/strict';
import { PALETTES, SKY_VARIANTS } from '../lib/palettes.ts';
import { POSTER_THEMES } from '../../poster/lib/themes.ts';

// The painted constellation figures are light on transparent, so they only show on a dark sky.
// On a light paper they must be redrawn in ink, and a little stronger.
test('light papers redraw the painted figures in ink, dark skies keep their colours', () => {
  for (const style of SKY_VARIANTS) {
    const palette = PALETTES[style];
    if (POSTER_THEMES[style].dark) {
      assert.equal(palette.artInk, null, `${style} keeps the painted colours`);
      assert.equal(palette.artBoost, 1, `${style} keeps the painted opacity`);
    } else {
      assert.match(palette.artInk ?? '', /^#[0-9a-f]{6}$/i, `${style} has an ink colour`);
      assert.ok(palette.artBoost > 1, `${style} draws the figures stronger`);
    }
  }
});

test('the ink is dark enough to read on its paper', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  for (const style of SKY_VARIANTS) {
    const ink = PALETTES[style].artInk;
    if (!ink) continue;
    const paper = POSTER_THEMES[style].paperStops[0]![1];
    assert.ok(lum(paper) - lum(ink) > 0.5, `${style}: ink against ${paper}`);
  }
});
