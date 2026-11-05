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

test('the bright limb points where the Sun is (Meeus, example 48.a: 285.0°)', async () => {
  const { brightLimbPositionAngle } = await import('../lib/phase.ts');
  const chi = brightLimbPositionAngle({ ra: 134.6885, dec: 13.7684 }, { ra: 20.6579, dec: 8.6964 });
  assert.ok(Math.abs(chi - 285.0) < 0.2, String(chi));
});

test('the lit side turns to face the Sun, north up and east on the left', async () => {
  const { litAxisRotation } = await import('../lib/phase.ts');
  assert.equal(litAxisRotation(270, true), 0); // Sun due west of a waxing Moon: lit on the right
  assert.equal(litAxisRotation(90, false), 0); // due east of a waning one: lit on the left
  assert.equal(litAxisRotation(180, true), 90); // Sun to the south: lit side points down
  assert.equal(litAxisRotation(0, true), -90); // to the north: points up
  assert.equal(litAxisRotation(250, true), 20); // a little south of west: tipped 20° downwards
  assert.equal(litAxisRotation(110, false), -20);
  for (const pa of [0, 37, 180, 285, 359.9]) {
    for (const waxing of [true, false]) {
      const r = litAxisRotation(pa, waxing);
      assert.ok(r > -180 && r <= 180, `${pa}/${waxing}: ${r}`);
    }
  }
});

test('the lit side fades towards the terminator, and the full Moon is flat', async () => {
  const { limbShade } = await import('../lib/phase.ts');
  assert.equal(limbShade(0), null, 'new: nothing is lit');
  assert.equal(limbShade(1), null, 'full: no fading at all');
  for (const k of [0.05, 0.3, 0.5, 0.8, 0.95]) {
    const s = limbShade(k)!;
    assert.ok(s, `k=${k}`);
    assert.ok(Math.abs(s.from - (1 - 2 * k)) < 1e-9, 'starts where the terminator crosses the axis');
    assert.equal(s.stops[0]!.alpha, 1, 'dark as the shadow at the terminator');
    assert.equal(s.stops.at(-1)!.alpha, 0, 'full brightness at the limb');
    for (let i = 1; i < s.stops.length; i++) {
      assert.ok(s.stops[i]!.alpha <= s.stops[i - 1]!.alpha + 1e-9, `k=${k}: only gets brighter outwards`);
    }
  }
});
