import { readStoreConfig, type StoreConfig } from './store.ts';
import { readTelegramConfig, type TelegramConfig } from './telegram.ts';

/**
 * Payment settings, read from the environment on the server. The buyer transfers the
 * price to the owner's card; the owner confirms each payment from Telegram.
 *
 *   PAYMENT_CARD                    16-digit card the buyers pay into
 *   PAYMENT_CARD_HOLDER             optional, shown with the number so buyers can check the name
 *   PAYMENT_CARD_BANK               optional, e.g. "بلو"
 *   TELEGRAM_BOT_TOKEN / _CHAT_ID / _WEBHOOK_SECRET   see telegram.ts
 *   UPSTASH_REDIS_REST_URL/_TOKEN   where orders are kept; the Vercel KV_REST_API_URL/_TOKEN
 *                                   names work too
 *   PAYMENT_TOKEN_SECRET            ≥ 32 random characters, signs the download token
 *   NEXT_PUBLIC_PREMIUM_PRICE_IRT   price in tomans (shown in the UI; a few tomans are added per order)
 */
export type PaymentCard = { number: string; holder: string | null; bank: string | null };

export type PaymentConfig = {
  card: PaymentCard;
  store: StoreConfig;
  telegram: TelegramConfig;
  secret: string;
  /** The advertised price in tomans. Each order adds 1 to 99 tomans on top. */
  priceToman: number;
};

const MIN_TOMAN = 1_000;
const MAX_TOMAN = 100_000_000;

type Env = Record<string, string | undefined>;

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';

/** A card number as 16 plain digits (spaces, dashes and Persian digits are fine), or null. */
export function normalizeCardNumber(raw: string | undefined): string | null {
  const digits = (raw ?? '')
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d)))
    .replace(/[\s-]/g, '');
  return /^\d{16}$/.test(digits) ? digits : null;
}

const text = (raw: string | undefined) => raw?.trim().slice(0, 80) || null;

export function readPaymentConfig(env: Env = process.env): PaymentConfig | null {
  const number = normalizeCardNumber(env.PAYMENT_CARD);
  const store = readStoreConfig(env);
  const telegram = readTelegramConfig(env);
  const secret = env.PAYMENT_TOKEN_SECRET?.trim();
  const priceToman = Number(env.NEXT_PUBLIC_PREMIUM_PRICE_IRT);

  if (!number || !store || !telegram) return null;
  if (!secret || secret.length < 32) return null;
  if (!Number.isInteger(priceToman) || priceToman < MIN_TOMAN || priceToman > MAX_TOMAN) {
    return null;
  }

  return {
    card: { number, holder: text(env.PAYMENT_CARD_HOLDER), bank: text(env.PAYMENT_CARD_BANK) },
    store,
    telegram,
    secret,
    priceToman,
  };
}
