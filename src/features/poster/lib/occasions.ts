/**
 * Occasions that have their own landing page (/occasions/<slug>) and a ready-made start in
 * the editor (/create?occasion=<slug>). The wording lives in messages/fa.json under
 * `Occasions.<slug>`; the look is chosen here so it can be tested.
 */
export const OCCASION_SLUGS = ['birthday', 'anniversary', 'newborn', 'wedding'] as const;
export type OccasionSlug = (typeof OCCASION_SLUGS)[number];

export function isOccasionSlug(value: unknown): value is OccasionSlug {
  return typeof value === 'string' && (OCCASION_SLUGS as readonly string[]).includes(value);
}
