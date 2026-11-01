/**
 * Contact channels and the optional donation card, read from public env
 * variables so none of it is committed to the (public) repository:
 *
 *   NEXT_PUBLIC_CONTACT_EMAIL       e.g. hello@example.ir
 *   NEXT_PUBLIC_CONTACT_TELEGRAM    username, with or without @ or t.me/
 *   NEXT_PUBLIC_CONTACT_INSTAGRAM   username, with or without @ or instagram.com/
 *   NEXT_PUBLIC_DONATION_CARD       16-digit bank card number
 *   NEXT_PUBLIC_DONATION_HOLDER     name of the card holder, shown next to the number
 *   NEXT_PUBLIC_DONATION_BANK       bank name, shown next to the number
 *
 * Every value is optional; whatever is missing or malformed is simply not shown.
 * They are NEXT_PUBLIC_ so the same values are visible on the server and in the browser.
 */
export type SupportConfig = {
  email: string | null;
  telegram: string | null;
  instagram: string | null;
  card: { number: string; holder: string | null; bank: string | null } | null;
};

type Env = Record<string, string | undefined>;

// Each variable is spelled out so Next.js can inline it into client bundles.
const publicEnv = (): Env => ({
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_CONTACT_TELEGRAM: process.env.NEXT_PUBLIC_CONTACT_TELEGRAM,
  NEXT_PUBLIC_CONTACT_INSTAGRAM: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM,
  NEXT_PUBLIC_DONATION_CARD: process.env.NEXT_PUBLIC_DONATION_CARD,
  NEXT_PUBLIC_DONATION_HOLDER: process.env.NEXT_PUBLIC_DONATION_HOLDER,
  NEXT_PUBLIC_DONATION_BANK: process.env.NEXT_PUBLIC_DONATION_BANK,
});

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const latinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

/** A bank card number as 16 plain digits (spaces, dashes and Persian digits are fine), or null. */
export function normalizeCard(raw: string | undefined): string | null {
  const digits = latinDigits(raw ?? '').replace(/[\s-]/g, '');
  return /^\d{16}$/.test(digits) ? digits : null;
}

/** "6219861818944190" → "6219 8618 1894 4190". */
export function formatCard(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** A username from "@name", "name" or a full profile link; null when it is not a plausible handle. */
export function normalizeHandle(
  raw: string | undefined,
  hosts: readonly string[],
): string | null {
  let value = (raw ?? '').trim();
  if (!value) return null;
  for (const host of hosts) {
    value = value.replace(new RegExp(`^(https?://)?(www\\.)?${host.replace('.', '\\.')}/`, 'i'), '');
  }
  value = value.replace(/^@/, '').replace(/[/?#].*$/, '');
  return /^[A-Za-z0-9_.]{3,32}$/.test(value) ? value : null;
}

export function normalizeEmail(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  return /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/.test(value) ? value : null;
}

const text = (raw: string | undefined) => raw?.trim().slice(0, 80) || null;

export function readSupportConfig(env: Env = publicEnv()): SupportConfig {
  const number = normalizeCard(env.NEXT_PUBLIC_DONATION_CARD);
  return {
    email: normalizeEmail(env.NEXT_PUBLIC_CONTACT_EMAIL),
    telegram: normalizeHandle(env.NEXT_PUBLIC_CONTACT_TELEGRAM, ['t.me', 'telegram.me']),
    instagram: normalizeHandle(env.NEXT_PUBLIC_CONTACT_INSTAGRAM, ['instagram.com']),
    card: number
      ? {
          number,
          holder: text(env.NEXT_PUBLIC_DONATION_HOLDER),
          bank: text(env.NEXT_PUBLIC_DONATION_BANK),
        }
      : null,
  };
}

export function hasContact(config: SupportConfig): boolean {
  return !!(config.email || config.telegram || config.instagram);
}
