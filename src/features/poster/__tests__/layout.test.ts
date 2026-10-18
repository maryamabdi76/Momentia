import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPosterSvg,
  estimateWidth,
  POSTER_HEIGHT,
  wrapLines,
  type PosterSvgOptions,
} from '../lib/poster-svg.ts';
import { POSTER_STYLES, type PosterStyle } from '../lib/themes.ts';

const labels = {
  headerLine: 'یادگار یک شب',
  north: 'شمال',
  south: 'جنوب',
  east: 'شرق',
  west: 'غرب',
  mapAlt: 'نقشه',
  watermark: 'آسمان شب ما',
  disclaimer: '',
  timeAt: 'ساعت',
};
const data = {
  title: 'بلندترین شب، کنار تو',
  names: 'مریم و جلال',
  quote: 'از آن شب، هر ستاره نشانی از توست.',
  city: 'تهران',
  dateLabel: '۳۰ آذر ۱۴۰۵',
  timeLabel: '۲۱:۰۰',
  showDate: true,
  showCity: true,
  style: 'gold' as const,
};
const chartSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1350"><circle r="5"/></svg>';

// the longest the create form lets a person type: title 60, names 40, quote 100
const MAX = {
  ...data,
  title: 'بلندترین و خاطره‌انگیزترین شب زندگی ما دو نفر در کنار هم',
  names: 'مریم و جلال و همه‌ی دوستان خوب و مهربانمان',
  quote: 'از آن شب، هر ستاره‌ای که در آسمان می‌درخشد نشانی از توست و هر بار که به بالا نگاه می‌کنم تو را می‌بینم',
};

const build = (over: Partial<Omit<typeof data, 'style'>> & { style?: PosterStyle; template?: 'circle' | 'full' }, extra: Partial<PosterSvgOptions> = {}) =>
  buildPosterSvg({ data: { ...data, ...over }, labels, chartSvg, watermark: true, ...extra });

/** Every <text>: its content and baseline, in document order. */
const texts = (svg: string) =>
  [...svg.matchAll(/<text [^>]*? y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({
    y: Number(m[1]),
    s: m[2]!,
  }));

/** Size of the embedded chart (the circle layout's `<svg x y width height>`). */
const chartBox = (svg: string) => {
  const m = svg.match(/<svg x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  return m ? { x: Number(m[1]), y: Number(m[2]), size: Number(m[3]) } : null;
};

test('wrapLines keeps every word, at any width', () => {
  for (const width of [200, 330, 500, 738]) {
    for (const balance of [false, true]) {
      const lines = wrapLines(MAX.title, 64.8, 700, width, estimateWidth, balance);
      assert.equal(lines.join(' '), MAX.title, `width ${width}, balance ${balance}`);
    }
  }
  assert.deepEqual(wrapLines('   ', 30, 400, 500, estimateWidth, true), []);
});

test('wrapLines: balanced lines are never wider than greedy ones, and use the same number of lines', () => {
  const greedy = wrapLines(MAX.title, 64.8, 700, 738, estimateWidth, false);
  const even = wrapLines(MAX.title, 64.8, 700, 738, estimateWidth, true);
  assert.equal(even.length, greedy.length);
  const widest = (ls: string[]) => Math.max(...ls.map((l) => estimateWidth(l, 64.8, 700)));
  assert.ok(widest(even) <= widest(greedy));
  // the last line is no longer a lone short word
  const last = (ls: string[]) => estimateWidth(ls.at(-1)!, 64.8, 700);
  assert.ok(last(even) >= last(greedy));
});

test('a very long single word is kept whole rather than dropped', () => {
  const word = 'ا'.repeat(80);
  assert.deepEqual(wrapLines(word, 64.8, 700, 300, estimateWidth, true), [word]);
});

test('the longest title and quote are written out in full, in both layouts and every style', () => {
  for (const style of POSTER_STYLES) {
    for (const template of ['circle', 'full'] as const) {
      const all = texts(build({ ...MAX, style, template })).map((t) => t.s).join(' ');
      assert.ok(all.includes(MAX.title), `${style}/${template}: title`);
      assert.ok(all.includes(MAX.quote), `${style}/${template}: quote`);
      assert.ok(all.includes(MAX.names), `${style}/${template}: names`);
    }
  }
});

test('text stays on the page, in reading order, and clear of the footer', () => {
  for (const template of ['circle', 'full'] as const) {
    for (const over of [{}, MAX, { ...MAX, showCity: false, showDate: false }, { names: '' }, { quote: '' }]) {
      const svg = build({ ...over, template });
      const ys = texts(svg).map((t) => t.y);
      assert.ok(ys.every((y) => y > 0 && y < POSTER_HEIGHT - 63), `${template}: inside the frame ${ys}`);
      // body text (everything after the eyebrow and compass words) only moves downwards
      const body = texts(svg)
        .filter((t) => ![labels.headerLine, labels.north, labels.south, labels.east, labels.west].includes(t.s))
        .map((t) => t.y);
      assert.deepEqual([...body].sort((a, b) => a - b), body, `${template}: reading order`);
    }
  }
});

test('circle layout: the chart gives way to long text instead of the text running off the page', () => {
  const normal = chartBox(build({ template: 'circle' }))!;
  const long = chartBox(build({ ...MAX, template: 'circle' }))!;
  assert.ok(Math.abs(normal.size - 575.64) < 0.01, `normal chart is 78% of the column: ${normal.size}`);
  assert.ok(long.size < normal.size && long.size > 100, `long text shrinks the chart: ${long.size}`);
  // and it stays centred
  assert.ok(Math.abs(long.x + long.size / 2 - 450) < 0.01);
});

test('only what is on the poster is drawn: no divider, empty lines or blank text', () => {
  const dividers = (svg: string) => (svg.match(/url\(#divL\)/g) ?? []).length;
  assert.equal(dividers(build({})), 1);
  assert.equal(dividers(build({ quote: '' })), 0, 'no quote → no divider');
  assert.equal(dividers(build({ title: '', names: '' })), 0, 'only a quote → no divider');
  assert.equal(dividers(build({ title: '', names: '', quote: '' })), 0);
  for (const over of [{ names: '' }, { title: '', names: '', quote: '' }, { showCity: false, showDate: false }]) {
    assert.ok(texts(build(over)).every((t) => t.s.trim() !== ''), 'no empty <text>');
  }
});

test('divider lines are brightest at their outer ends, as in the preview', () => {
  const svg = build({});
  assert.match(svg, /<linearGradient id="divL"[^>]*><stop offset="0" stop-color="#CEB47B"\/>/);
  assert.match(svg, /<linearGradient id="divR"[^>]*><stop offset="0" stop-color="#CEB47B" stop-opacity="0"\/>/);
});

test('meta line: parts are joined by diamonds, place first on the right', () => {
  const svg = build({});
  const meta = texts(svg).filter((t) => [data.city, data.dateLabel, `${labels.timeAt} ${data.timeLabel}`].includes(t.s));
  assert.equal(meta.length, 3);
  const xs = [...svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
    .filter((m) => meta.some((t) => t.s === m[2]))
    .map((m) => ({ x: Number(m[1]), s: m[2]! }));
  assert.deepEqual(xs.sort((a, b) => b.x - a.x).map((m) => m.s), [data.city, data.dateLabel, `${labels.timeAt} ${data.timeLabel}`]);
  // the meta diamonds start with `d=` (the divider's star has a transform first)
  const diamonds = (s: string) => (s.match(/<path d="M[\d.]+ [\d.]+ L/g) ?? []).length;
  assert.equal(diamonds(svg), 2, 'two diamonds between three parts');
  assert.equal(diamonds(build({ showDate: false })), 0, 'one part, no diamond');
});

test('the premium file leaves the watermark out, everything else stays put', () => {
  const free = build({ template: 'full' });
  const premium = build({ template: 'full' }, { watermark: false });
  assert.ok(free.includes(labels.watermark) && !premium.includes(labels.watermark));
  const withoutMark = (svg: string) => texts(svg).filter((t) => t.s !== labels.watermark);
  // text above the footer is not moved by removing the mark in the circle layout
  const a = texts(build({}));
  const b = texts(build({}, { watermark: false }));
  assert.deepEqual(
    a.filter((t) => t.s !== labels.watermark).map((t) => t.s),
    b.map((t) => t.s),
  );
  assert.ok(withoutMark(free).length === texts(premium).length);
});
