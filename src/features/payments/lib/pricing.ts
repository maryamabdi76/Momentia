/**
 * What each premium file costs. Pure and import-free, so the server (which decides the
 * amount to pay) and the browser (which only shows it) use the same numbers.
 *
 * Every price is a multiple of one unit, the base price (NEXT_PUBLIC_PREMIUM_PRICE_IRT,
 * 15,000 tomans by default):
 *
 *   sky poster          2 units, plus 1 unit for each premium option it uses
 *   moon poster         2 units
 *   treasure map        3 units
 *
 * A payment belongs to one product: paying for the moon poster does not unlock the map.
 * For the sky poster it also covers the premium options the poster used when it was paid;
 * switching on another one later costs only that option.
 */
export const PRODUCTS = ['sky', 'moon', 'map'] as const;
export type Product = (typeof PRODUCTS)[number];

/** Premium options of the sky poster. */
export const FEATURES = ['fullTemplate', 'paintedConstellations'] as const;
export type Feature = (typeof FEATURES)[number];

export const DEFAULT_UNIT_TOMAN = 15_000;

const BASE_UNITS: Record<Product, number> = { sky: 2, moon: 2, map: 3 };
const FEATURE_UNITS: Record<Feature, number> = { fullTemplate: 1, paintedConstellations: 1 };
const PRODUCT_FEATURES: Record<Product, readonly Feature[]> = {
  sky: FEATURES,
  moon: [],
  map: [],
};

export const isProduct = (value: unknown): value is Product =>
  typeof value === 'string' && (PRODUCTS as readonly string[]).includes(value);

/** The options a product can have, from anything (an unknown value, duplicates, options of another product). */
export function normalizeFeatures(product: Product, raw: unknown): Feature[] {
  if (!Array.isArray(raw)) return [];
  const allowed = PRODUCT_FEATURES[product];
  return FEATURES.filter((f) => allowed.includes(f) && raw.includes(f));
}

/** Price in tomans of a product with these options, as a whole new purchase. */
export function priceToman(
  product: Product,
  features: readonly Feature[],
  unit: number = DEFAULT_UNIT_TOMAN,
): number {
  const options = normalizeFeatures(product, features);
  return (BASE_UNITS[product] + options.reduce((sum, f) => sum + FEATURE_UNITS[f], 0)) * unit;
}

/** Does a payment that covered `paid` cover everything `needed` asks for? */
export const covers = (paid: readonly Feature[], needed: readonly Feature[]): boolean =>
  needed.every((f) => paid.includes(f));

/**
 * What a buyer still owes for `needed`, given the options an earlier payment for the same
 * product already covered (`paid`, or `null` for no earlier payment), and what the new
 * payment will then cover.
 */
export function quote(
  product: Product,
  needed: readonly Feature[],
  paid: readonly Feature[] | null,
  unit: number = DEFAULT_UNIT_TOMAN,
): { amountToman: number; covered: Feature[] } {
  const covered = normalizeFeatures(product, [...(paid ?? []), ...needed]);
  const owed = priceToman(product, covered, unit) - (paid ? priceToman(product, paid, unit) : 0);
  return { amountToman: owed, covered };
}
