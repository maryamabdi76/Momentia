import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMoonPosterSvg } from '../lib/moon-svg.ts';

const labels = { headerLine: 'ماه آن شب', watermark: 'آسمان شب ما', timeAt: 'ساعت', mapAlt: 'ماه' };
const facts = { illumination: 0.92, waxing: true, latitude: 35.7, phaseLine: 'ماه رو به بدر · ۹۲٪ روشن' };
const data = {
  title: 'بلندترین شب، کنار تو',
  names: 'شیرین و فرهاد',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  style: 'violet' as const,
  showDate: true,
  showCity: true,
  showDetails: true,
  showStars: true,
  city: 'تهران',
  dateLabel: '۳۰ آذر ۱۴۰۵',
  timeLabel: '۲۱:۰۰',
};
// the longest the form allows: title 60 characters, quote 100
const LONG_TITLE = 'بلندترین و خاطره‌انگیزترین شب زندگی ما دو نفر در کنار هم';
const LONG_QUOTE = 'از آن شب، هر ستاره‌ای که در آسمان می‌درخشد نشانی از توست و هر بار که به بالا نگاه می‌کنم تو را';

const build = (over: Partial<typeof data>) =>
  buildMoonPosterSvg({ data: { ...data, ...over }, facts, labels, watermark: true });

const texts = (svg: string) =>
  [...svg.matchAll(/<text [^>]*? y="([\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({
    y: Number(m[1]),
    size: Number(m[2]),
    s: m[3]!,
  }));

/** Scale applied to the Moon block, 1 when it is left alone. */
const moonScale = (svg: string) => Number(svg.match(/translate\(450 202\) scale\(([\d.]+)\)/)?.[1] ?? 1);

test('a long title is written out in full, however many lines it takes', () => {
  for (const title of [LONG_TITLE, 'برای همیشه کنار تو می‌مانم']) {
    const lines = texts(build({ title })).filter((t) => t.size === 60);
    assert.ok(lines.length >= 2, 'it wraps');
    // lines are emitted bottom-up; read them top-down
    assert.equal(lines.map((t) => t.s).reverse().join(' '), title);
  }
});

test('the quote is written out in full', () => {
  const lines = texts(build({ quote: LONG_QUOTE })).filter((t) => t.size === 30);
  assert.equal(lines.map((t) => t.s).join(' '), LONG_QUOTE);
});

test('normal text leaves the Moon at full size, exactly where it was', () => {
  assert.equal(moonScale(build({})), 1);
  const phase = texts(build({})).find((t) => t.s === facts.phaseLine)!;
  assert.equal(phase.y, 878);
});

test('long text shrinks the Moon instead of colliding with it', () => {
  for (const over of [{ title: 'برای همیشه کنار تو می‌مانم' }, { title: LONG_TITLE }, { title: LONG_TITLE, quote: LONG_QUOTE }]) {
    for (const showDetails of [true, false]) {
      const svg = build({ ...over, showDetails });
      const all = texts(svg);
      const titleTop = Math.min(...all.filter((t) => t.size === 60).map((t) => t.y)) - 60 * 0.8;
      const scale = moonScale(svg);
      assert.ok(scale < 1 && scale >= 0.5, `shrinks, but not to nothing: ${scale}`);
      // the bottom of what the Moon block draws: the phase line, or the outer ring
      const bottom = showDetails
        ? all.find((t) => t.s === facts.phaseLine)!.y + 10
        : 202 + 2 * (280 + 38) * scale;
      assert.ok(bottom < titleTop, `${JSON.stringify(over)} details=${showDetails}: ${bottom} clears ${titleTop}`);
    }
  }
});
