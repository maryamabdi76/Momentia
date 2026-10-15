import test from 'node:test';
import assert from 'node:assert/strict';
import { POSTER_STYLES, POSTER_THEMES, isPosterStyle, paperCss } from '../lib/themes.ts';
import { PALETTES, SKY_VARIANTS } from '../../sky/lib/palettes.ts';

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

test('every poster style has both a poster theme and a chart palette', () => {
  assert.deepEqual([...POSTER_STYLES], [...SKY_VARIANTS]);
  for (const style of POSTER_STYLES) {
    assert.ok(POSTER_THEMES[style], `theme for ${style}`);
    assert.ok(PALETTES[style], `palette for ${style}`);
    assert.ok(isPosterStyle(style));
    assert.match(paperCss(POSTER_THEMES[style]), /gradient\(/);
  }
  assert.equal(isPosterStyle('neon'), false);
  assert.equal(isPosterStyle(undefined), false);
});

test('title text is readable on every paper (WCAG AA, 4.5:1) and stars stand out from it', () => {
  for (const style of POSTER_STYLES) {
    const { paperStops, ink, dark } = POSTER_THEMES[style];
    for (const [, paper] of paperStops) {
      assert.ok(contrast(ink, paper) >= 4.5, `${style}: ink on ${paper} = ${contrast(ink, paper).toFixed(1)}`);
    }
    // "dark" must agree with the actual paper brightness
    assert.equal(luminance(paperStops[1]![1]) < 0.2, dark, `${style}: dark flag`);
    // a typical mid-colour star against the paper
    const star = PALETTES[style].star(0.6);
    assert.ok(contrast(star, paperStops[1]![1]) >= 4.5, `${style}: star contrast`);
  }
});
