import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { ART_GROUPS, MAP_ART } from '../lib/art.ts';

test('every picture is in exactly one group', () => {
  const listed = ART_GROUPS.flatMap((g) => [...g.arts]);
  assert.equal(listed.length, new Set(listed).size, 'a picture is in two groups');
  assert.deepEqual([...listed].sort(), [...MAP_ART].sort());
});

test('every picture has a colour and a pen file', () => {
  for (const id of MAP_ART) {
    assert.ok(existsSync(`public/map-art/${id}.webp`), `missing colour ${id}`);
    assert.ok(existsSync(`public/map-art/line/${id}.webp`), `missing pen ${id}`);
  }
});
