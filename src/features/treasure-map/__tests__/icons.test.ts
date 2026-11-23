import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ICON_GROUPS, MAP_ICONS, iconMarkup } from '../lib/illustrations.ts';

test('every simple icon is in exactly one group', () => {
  const listed = ICON_GROUPS.flatMap((g) => [...g.icons]);
  assert.equal(listed.length, new Set(listed).size);
  assert.deepEqual([...listed].sort(), [...MAP_ICONS].sort());
  for (const icon of MAP_ICONS) assert.ok(iconMarkup(icon).startsWith('<'), icon);
});
