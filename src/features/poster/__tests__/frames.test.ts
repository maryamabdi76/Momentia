import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FRAME,
  FRAME_REACH,
  POSTER_FRAMES,
  frameSvg,
  isPosterFrame,
} from '../lib/frames.ts';
import { buildPosterSvg, POSTER_HEIGHT, POSTER_WIDTH } from '../lib/poster-svg.ts';
import { POSTER_STYLES, POSTER_THEMES } from '../lib/themes.ts';
import { parseDraft } from '../lib/draft.ts';

const W = POSTER_WIDTH;
const H = POSTER_HEIGHT;

test('frames: the list and the guard agree, and classic stays the default', () => {
  assert.ok(POSTER_FRAMES.length >= 2);
  for (const f of POSTER_FRAMES) assert.equal(isPosterFrame(f), true);
  assert.equal(isPosterFrame('neon'), false);
  assert.equal(isPosterFrame(undefined), false);
  assert.equal(DEFAULT_FRAME, 'classic');
  assert.equal(new Set(POSTER_FRAMES).size, POSTER_FRAMES.length, 'no duplicates');
});

test('the classic frame is exactly what the export drew before frames were options', () => {
  for (const style of POSTER_STYLES) {
    const t = POSTER_THEMES[style];
    const legacy =
      `<rect x="21.6" y="21.6" width="${W - 43.2}" height="${H - 43.2}" fill="none" stroke="${t.frame}" stroke-width="1.4"/>` +
      `<rect x="33.3" y="33.3" width="${W - 66.6}" height="${H - 66.6}" fill="none" stroke="${t.frameSoft}" stroke-width="1.4"/>` +
      [
        [41, 41, 1, 1],
        [W - 41, 41, -1, 1],
        [41, H - 41, 1, -1],
        [W - 41, H - 41, -1, -1],
      ]
        .map(
          ([x, y, sx, sy]) =>
            `<g transform="translate(${x} ${y}) scale(${sx! * 2.25} ${sy! * 2.25}) translate(-1 -1)" fill="none" stroke="${t.frame}" stroke-width="0.9"><path d="M1 19 V6 Q1 1 6 1 H19"/><circle cx="6" cy="6" r="1.3" fill="${t.frame}" stroke="none"/></g>`,
        )
        .join('');
    assert.equal(frameSvg('classic', t, W, H), legacy, style);
  }
});

test('every frame is drawn in the theme colours, with sound numbers, and none draws nothing', () => {
  for (const style of POSTER_STYLES) {
    const t = POSTER_THEMES[style];
    for (const f of POSTER_FRAMES) {
      const svg = frameSvg(f, t, W, H);
      if (f === 'none') {
        assert.equal(svg, '');
        continue;
      }
      assert.ok(svg.includes(t.frame), `${f}/${style}: uses the frame colour`);
      assert.ok(!/NaN|undefined|Infinity/.test(svg), `${f}/${style}: no broken numbers`);
    }
  }
});

test('the frames look different from one another', () => {
  const t = POSTER_THEMES.gold;
  const drawn = POSTER_FRAMES.map((f) => frameSvg(f, t, W, H));
  assert.equal(new Set(drawn).size, POSTER_FRAMES.length);
});

test('no frame reaches into the text column', () => {
  // the column starts 63 units from the bottom edge, 72 from the top and 81 from the sides
  for (const f of POSTER_FRAMES) {
    assert.ok(FRAME_REACH[f] <= 56, `${f} reaches ${FRAME_REACH[f]}`);
  }
  assert.equal(FRAME_REACH.none, 0);
});

test('the heavier thumbnail lines scale every stroke and leave the shapes alone', () => {
  const t = POSTER_THEMES.gold;
  const base = frameSvg('minimal', t, W, H);
  const heavy = frameSvg('minimal', t, W, H, { strokeScale: 2 });
  assert.ok(base.includes('stroke-width="1.6"'));
  assert.ok(heavy.includes('stroke-width="3.2"'));
  assert.equal(base.replace(/stroke-width="[\d.]+"/g, ''), heavy.replace(/stroke-width="[\d.]+"/g, ''));
});

test('the exported poster carries the chosen frame, and the classic one without a choice', () => {
  const t = POSTER_THEMES.gold;
  const base = {
    title: 'عنوان',
    names: 'نام',
    quote: 'جمله',
    city: 'تهران',
    dateLabel: '۳۰ آذر ۱۴۰۵',
    timeLabel: '۲۱:۰۰',
    showDate: true,
    showCity: true,
    style: 'gold' as const,
  };
  const labels = {
    headerLine: 'x',
    north: 'ش',
    south: 'ج',
    east: 'ر',
    west: 'غ',
    mapAlt: 'نقشه',
    watermark: 'آسمان شب ما',
    disclaimer: '',
    timeAt: 'ساعت',
  };
  const chartSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1350"><circle r="5"/></svg>';
  const build = (frame?: (typeof POSTER_FRAMES)[number]) =>
    buildPosterSvg({ data: { ...base, ...(frame ? { frame } : {}) }, labels, chartSvg, watermark: true });

  assert.equal(build(), build('classic'));
  for (const f of POSTER_FRAMES) {
    assert.ok(build(f).includes(frameSvg(f, t, W, H)), `${f} is in the file`);
  }
  assert.ok(!build('none').includes('stroke-width="1.4"'), 'none has no border lines');
});

test('older drafts without a frame still load, and an unknown frame is refused', () => {
  const draft = {
    moment: { city: 'تهران', timezone: 'Asia/Tehran', day: '30', month: 'آذر', year: '1405', time: '21:00', noExactTime: false },
    personal: { title: 'a', names: 'b', quote: 'c', style: 'gold', template: 'circle', showDate: true, showCity: true },
  };
  assert.ok(parseDraft(draft));
  assert.ok(parseDraft({ ...draft, personal: { ...draft.personal, frame: 'stars' } }));
  assert.equal(parseDraft({ ...draft, personal: { ...draft.personal, frame: 'neon' } }), null);
});
