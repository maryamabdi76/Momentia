import test from 'node:test';
import assert from 'node:assert/strict';
import { litPath, moonRotation, phaseKey, shadowPath } from '../lib/phase.ts';

test('phase names follow the elongation from the Sun', () => {
  assert.equal(phaseKey(0), 'new');
  assert.equal(phaseKey(359), 'new');
  assert.equal(phaseKey(45), 'waxingCrescent');
  assert.equal(phaseKey(90), 'firstQuarter');
  assert.equal(phaseKey(135), 'waxingGibbous');
  assert.equal(phaseKey(180), 'full');
  assert.equal(phaseKey(225), 'waningGibbous');
  assert.equal(phaseKey(270), 'lastQuarter');
  assert.equal(phaseKey(315), 'waningCrescent');
});

test('a quarter Moon has a straight terminator', () => {
  assert.match(litPath(100, 0.5, true), /A0 100 /);
});

test('a waxing Moon is lit on the right, a waning one on the left', () => {
  assert.match(litPath(100, 0.3, true), /^M0 -100A100 100 0 0 1 /);
  assert.match(litPath(100, 0.3, false), /^M0 -100A100 100 0 0 0 /);
});

test('crescent and gibbous terminators bulge opposite ways', () => {
  const crescent = litPath(100, 0.2, true);
  const gibbous = litPath(100, 0.8, true);
  assert.ok(crescent.includes('A60 100 0 0 0 '));
  assert.ok(gibbous.includes('A60 100 0 0 1 '));
});

test('the shadow is the disc plus the lit outline', () => {
  assert.ok(shadowPath(100, 0.4, true).endsWith(litPath(100, 0.4, true)));
});

test('the Moon is upside down south of the equator', () => {
  assert.equal(moonRotation(35.7), 0);
  assert.equal(moonRotation(-33.9), 180);
});
