import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPosterSvg, POSTER_HEIGHT, POSTER_WIDTH } from '../lib/poster-svg.ts';
import { POSTER_STYLES } from '../lib/themes.ts';
import { isPosterTemplate, POSTER_TEMPLATES } from '../lib/templates.ts';

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

/** y of every <text> in the output, in order. */
const textYs = (svg: string) => [...svg.matchAll(/<text [^>]*y="([\d.]+)"/g)].map((m) => Number(m[1]));

test('templates: the list and the guard agree', () => {
  assert.deepEqual([...POSTER_TEMPLATES], ['circle', 'full']);
  assert.ok(isPosterTemplate('full') && isPosterTemplate('circle'));
  assert.equal(isPosterTemplate('wide'), false);
});

test('full template: the sky is embedded full-page, under a fade, in every colour style', () => {
  for (const style of POSTER_STYLES) {
    const svg = buildPosterSvg({ data: { ...data, style, template: 'full' }, labels, chartSvg, watermark: true });
    assert.match(svg, /<svg x="0" y="0" width="900" height="1350"/, `${style}: full-page sky`);
    assert.match(svg, /id="scrimBottom"/);
    assert.ok(svg.indexOf('width="900" height="1350" viewBox') !== 0 && svg.indexOf('scrimBottom') > 0);
    // the sky is painted before the frame, so the frame sits on top of it
    assert.ok(svg.indexOf('<circle r="5"/>') < svg.indexOf('stroke-width="1.4"'), `${style}: frame over sky`);
  }
});

test('full template: text grows upwards from the bottom and always stays on the page', () => {
  const long = {
    ...data,
    template: 'full' as const,
    title: 'یک عنوان بسیار بسیار بلند برای این پوستر که باید به دو خط بشکند و از قاب بیرون نزند',
    quote: 'این یک جمله‌ی بلند است که چند خط می‌شود و باید بدون برخورد با هیچ چیز دیگری بالای خط پایانی بنشیند و بخواند.',
  };
  for (const variant of [long, { ...long, quote: '' }, { ...long, names: '' }, { ...long, showCity: false, showDate: false }]) {
    const svg = buildPosterSvg({ data: variant, labels, chartSvg, watermark: true });
    const ys = textYs(svg);
    assert.ok(ys.length >= 3);
    assert.ok(Math.min(...ys) > 0 && Math.max(...ys) < POSTER_HEIGHT, `inside the page: ${ys}`);
    assert.ok(ys.every((y) => Number.isFinite(y)));
  }
  assert.equal(POSTER_WIDTH, 900);
});

test('without a sky the full template falls back to the circle layout instead of an empty page', () => {
  const svg = buildPosterSvg({ data: { ...data, template: 'full' }, labels, chartSvg: '', watermark: true });
  assert.doesNotMatch(svg, /scrimBottom/);
  assert.match(svg, /شمال/); // the circle layout's own compass words
});
