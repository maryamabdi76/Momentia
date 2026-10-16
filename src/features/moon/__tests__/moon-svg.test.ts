import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMoonPosterSvg, type MoonPosterData } from '../lib/moon-svg.ts';
import { moonFactsFromSky } from '../lib/facts.ts';
import type { SkySnapshot } from '../../sky/lib/types.ts';

const data: MoonPosterData = {
  title: 'ماه <b>&</b>',
  names: 'الف و ب',
  quote: '',
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

test('user text is escaped and ids carry the prefix', () => {
  const svg = buildMoonPosterSvg({ data, facts, labels, watermark: true, idPrefix: 'x' });
  assert.ok(!svg.includes('<b>'));
  assert.ok(svg.includes('&lt;b&gt;&amp;'));
  assert.ok(svg.includes('id="x-disc"'));
  assert.ok(svg.includes('/moon/moon-nearside.jpg'));
});

test('the premium file has no watermark; southern skies turn the Moon over', () => {
  const free = buildMoonPosterSvg({ data, facts, labels, watermark: true });
  const premium = buildMoonPosterSvg({ data, facts, labels, watermark: false });
  assert.ok(free.includes('>wm<') && !premium.includes('>wm<'));
  const south = buildMoonPosterSvg({
    data,
    facts: { ...facts, latitude: -34 },
    labels,
    watermark: false,
  });
  assert.ok(south.includes('rotate(180)') && !premium.includes('rotate(180)'));
});

test('the phase caption is worded from the Moon of that night', () => {
  // only the Moon and the latitude matter here
  const sky = {
    latitude: 35.7,
    moon: { illumination: 0.152, elongation: 52, waxing: true },
  } as unknown as SkySnapshot;
  const f = moonFactsFromSky(sky, {
    phases: {
      new: 'n',
      waxingCrescent: 'wc',
      firstQuarter: 'fq',
      waxingGibbous: 'wg',
      full: 'f',
      waningGibbous: 'ng',
      lastQuarter: 'lq',
      waningCrescent: 'nc',
    },
    lit: (p) => `${p}%`,
  });
  assert.equal(f.phaseLine, 'wc · ۱۵%');
  assert.equal(f.waxing, true);
});
