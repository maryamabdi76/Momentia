import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { WALL_MOCKUP, frameBox } from '../lib/wall-mockup.ts';

test('the wall photo exists and its frame lies inside it', () => {
  assert.ok(existsSync(new URL(`../../../../public${WALL_MOCKUP.src}`, import.meta.url)));
  const b = frameBox(WALL_MOCKUP);
  assert.ok(b.left > 0 && b.top > 0);
  assert.ok(b.left + b.width < 100 && b.top + b.height < 100);
  // a poster is 2:3; the frame must be close to it or the print would look squashed
  const ratio = WALL_MOCKUP.frame.w / WALL_MOCKUP.frame.h;
  assert.ok(Math.abs(ratio - 2 / 3) < 0.06, `frame ratio ${ratio}`);
});
