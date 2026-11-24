import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { WALL_MOCKUP, WALL_MOCKUP_WIDE, frameBox, mockupFor } from '../lib/wall-mockup.ts';

for (const [name, mockup, shape] of [
  ['tall', WALL_MOCKUP, 2 / 3],
  ['wide', WALL_MOCKUP_WIDE, 3 / 2],
] as const) {
  test(`the ${name} wall photo exists and its frame lies inside it`, () => {
    assert.ok(existsSync(new URL(`../../../../public${mockup.src}`, import.meta.url)));
    const b = frameBox(mockup);
    assert.ok(b.left > 0 && b.top > 0);
    assert.ok(b.left + b.width < 100 && b.top + b.height < 100);
    // the frame must be close to the print's shape or the print would look squashed
    const ratio = mockup.frame.w / mockup.frame.h;
    assert.ok(Math.abs(ratio - shape) < 0.06, `frame ratio ${ratio}`);
  });
}

test('a wide print gets the wide room and a tall one the tall room', () => {
  assert.equal(mockupFor(3 / 2), WALL_MOCKUP_WIDE);
  assert.equal(mockupFor(2 / 3), WALL_MOCKUP);
});
