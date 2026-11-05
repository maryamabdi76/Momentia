import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMoonPosterSvg, MOON_POSTER_HEIGHT, MOON_POSTER_WIDTH, type MoonPosterData } from '../lib/moon-svg.ts';
import { POSTER_FRAMES, frameSvg } from '../../poster/lib/frames.ts';
import { POSTER_STYLES, POSTER_THEMES } from '../../poster/lib/themes.ts';

const W = MOON_POSTER_WIDTH;
const H = MOON_POSTER_HEIGHT;
const data: MoonPosterData = {
  title: 'ماهِ همان شب',
  names: 'شیرین و فرهاد',
  quote: 'همان ماه، همان شب؛ برای همیشه.',
  style: 'gold',
  showDate: true,
  showCity: true,
  showDetails: true,
  showStars: true,
  city: 'تهران',
  dateLabel: '۳۰ آذر ۱۴۰۵',
  timeLabel: '۲۱:۰۰',
};
const labels = { headerLine: 'h', watermark: 'wm', timeAt: 'ساعت', mapAlt: 'ماه' };
const facts = { illumination: 0.3, waxing: true, latitude: 35.7, phaseLine: 'هلال' };
const build = (d: MoonPosterData) => buildMoonPosterSvg({ data: d, facts, labels, watermark: true });

test('without a choice the Moon poster keeps the border it always had', () => {
  for (const style of POSTER_STYLES) {
    const t = POSTER_THEMES[style];
    const legacy =
      `<rect x="21.6" y="21.6" width="${W - 43.2}" height="${H - 43.2}" fill="none" stroke="${t.frame}" stroke-width="1.4"/>` +
      `<rect x="33.3" y="33.3" width="${W - 66.6}" height="${H - 66.6}" fill="none" stroke="${t.frameSoft}" stroke-width="1.4"/>`;
    const svg = build({ ...data, style });
    assert.ok(svg.includes(legacy), `${style}: both lines are as before`);
    assert.equal(svg, build({ ...data, style, frame: 'classic' }), `${style}: classic is the default`);
  }
});

test('every frame reaches the exported Moon poster, and each one is different', () => {
  const t = POSTER_THEMES.gold;
  const files = POSTER_FRAMES.map((frame) => build({ ...data, frame }));
  for (const [i, frame] of POSTER_FRAMES.entries()) {
    assert.ok(files[i]!.includes(frameSvg(frame, t, W, H)), `${frame} is in the file`);
  }
  assert.equal(new Set(files).size, POSTER_FRAMES.length);
});

test('the lit side tilts with litRotation, on top of the hemisphere turn', () => {
  const upright = build({ ...data });
  const tilted = buildMoonPosterSvg({ data, facts: { ...facts, litRotation: 20 }, labels, watermark: true });
  const south = buildMoonPosterSvg({ data, facts: { ...facts, litRotation: 20, latitude: -34 }, labels, watermark: true });
  assert.ok(upright.includes('transform="rotate(0)"'));
  assert.ok(tilted.includes('transform="rotate(20)"'));
  assert.ok(south.includes('transform="rotate(200)"'), 'tilt plus the 180° of the southern sky');
});

test('the lit side is shaded towards the terminator, except at new and full Moon', () => {
  const at = (illumination: number) =>
    buildMoonPosterSvg({ data, facts: { ...facts, illumination }, labels, watermark: true });
  assert.ok(at(0.5).includes('id="moon-shade"') && at(0.5).includes('fill="url(#moon-shade)"'));
  assert.ok(!at(0).includes('moon-shade'));
  assert.ok(!at(1).includes('moon-shade'));
  // the gradient runs from the terminator to the limb on the lit side: right for a waxing Moon, left for a waning one
  assert.match(at(0.5), /id="moon-shade"[^>]* x1="0" y1="0" x2="280"/);
  const waning = buildMoonPosterSvg({ data, facts: { ...facts, illumination: 0.5, waxing: false }, labels, watermark: true });
  assert.match(waning, /id="moon-shade"[^>]* x1="0" y1="0" x2="-280"/);
});
