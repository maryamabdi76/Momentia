import { timingSafeEqual } from 'node:crypto';

/**
 * The owner approves card-to-card payments from Telegram. When a buyer says "I paid", the
 * bot sends the owner a message with ✅ / ❌ buttons; pressing one calls our webhook.
 *
 *   TELEGRAM_BOT_TOKEN       from @BotFather
 *   TELEGRAM_CHAT_ID         the owner's own chat id; only this person's presses count
 *   TELEGRAM_WEBHOOK_SECRET  random string registered with setWebhook (secret_token)
 */
export type TelegramConfig = { botToken: string; chatId: string; webhookSecret: string };

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export function readTelegramConfig(env: Env = process.env): TelegramConfig | null {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  const webhookSecret = env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!botToken || !webhookSecret || !chatId || !/^-?\d{1,20}$/.test(chatId)) return null;
  // Telegram only accepts A-Z a-z 0-9 _ - in a secret token, 1 to 256 characters.
  if (!/^[A-Za-z0-9_-]{16,256}$/.test(webhookSecret)) return null;
  return { botToken, chatId, webhookSecret };
}

export class TelegramError extends Error {
  /** HTTP status Telegram answered with; 0 when it could not be reached at all. */
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'TelegramError';
    this.status = status;
  }
}

/** What the owner should check, in plain words, for the server log. Never shown to the buyer. */
export function describeTelegramFailure(err: unknown): string {
  if (!(err instanceof TelegramError)) return 'unexpected error while contacting Telegram';
  const d = err.message.toLowerCase();
  if (err.status === 0) return `Telegram could not be reached (${err.message}); network or timeout`;
  if (err.status === 401 || d.includes('unauthorized'))
    return 'TELEGRAM_BOT_TOKEN is wrong or revoked (Unauthorized)';
  if (d.includes('chat not found'))
    return 'TELEGRAM_CHAT_ID is wrong, or you never pressed Start on the bot (chat not found)';
  if (d.includes('blocked')) return 'the bot was blocked by the owner; unblock it and press Start';
  if (err.status === 429) return 'Telegram is rate limiting the bot (429)';
  return `Telegram refused the message: ${err.message}`;
}

async function call(
  config: TelegramConfig,
  method: string,
  body: Record<string, unknown>,
  fetchImpl: Fetch,
): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetchImpl(`https://api.telegram.org/bot${config.botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    // never include the URL: it contains the bot token
    throw new TelegramError(err instanceof Error ? err.name : 'network error', 0);
  }
  const data = (await res.json().catch(() => null)) as {
    ok?: unknown;
    result?: Record<string, unknown>;
    description?: unknown;
  } | null;
  if (!res.ok || data?.ok !== true) {
    // The description never contains the token, but keep the message short anyway.
    throw new TelegramError(
      typeof data?.description === 'string' ? data.description.slice(0, 200) : `telegram answered ${res.status}`,
      res.status,
    );
  }
  return data.result ?? {};
}

const faDigits = (n: string | number) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export function formatAmount(amountToman: number): string {
  return faDigits(amountToman.toLocaleString('en-US'));
}

/** The text the owner sees. No personal data: just the amount, the order and what the buyer typed. */
export function approvalText(input: {
  orderId: string;
  amountToman: number;
  payerLast4: string | null;
}): string {
  return [
    '🧾 پرداخت جدید کارت‌به‌کارت',
    `مبلغ دقیق: ${formatAmount(input.amountToman)} تومان`,
    `۴ رقم آخر کارت پرداخت‌کننده: ${input.payerLast4 ? faDigits(input.payerLast4) : 'وارد نشده'}`,
    `کد سفارش: ${input.orderId}`,
    '',
    'واریز را در اپ بانک ببین؛ اگر همین مبلغ آمده بود تأیید کن.',
  ].join('\n');
}

export const approveData = (orderId: string) => `ok:${orderId}`;
export const rejectData = (orderId: string) => `no:${orderId}`;

/** Network trouble, a timeout, a 429 or a 5xx may pass on a second try; a wrong token or chat id will not. */
const isTransient = (err: unknown) =>
  err instanceof TelegramError && (err.status === 0 || err.status === 429 || err.status >= 500);

export async function sendApprovalRequest(
  config: TelegramConfig,
  input: { orderId: string; amountToman: number; payerLast4: string | null },
  fetchImpl: Fetch = fetch,
  retryDelayMs = 600,
): Promise<void> {
  try {
    await sendOnce(config, input, fetchImpl);
  } catch (err) {
    if (!isTransient(err)) throw err;
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    await sendOnce(config, input, fetchImpl);
  }
}

async function sendOnce(
  config: TelegramConfig,
  input: { orderId: string; amountToman: number; payerLast4: string | null },
  fetchImpl: Fetch,
): Promise<void> {
  await call(
    config,
    'sendMessage',
    {
      chat_id: config.chatId,
      text: approvalText(input),
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ تأیید', callback_data: approveData(input.orderId) },
            { text: '❌ رد', callback_data: rejectData(input.orderId) },
          ],
        ],
      },
    },
    fetchImpl,
  );
}

/** Checks the `X-Telegram-Bot-Api-Secret-Token` header Telegram adds to every webhook call. */
export function verifyWebhookSecret(header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(secret);
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type Decision = {
  decision: 'paid' | 'rejected';
  orderId: string;
  callbackQueryId: string;
  chatId: number | string | null;
  messageId: number | null;
  /** The message text, so it can be kept when the buttons are replaced by the outcome. */
  messageText: string | null;
};

/**
 * Reads a webhook update. Returns a decision only for a button press made by the owner;
 * anything else (other users, other updates, malformed data) is ignored.
 */
export function parseDecision(update: unknown, ownerChatId: string): Decision | null {
  if (typeof update !== 'object' || update === null) return null;
  const cb = (update as { callback_query?: unknown }).callback_query;
  if (typeof cb !== 'object' || cb === null) return null;
  const q = cb as {
    id?: unknown;
    data?: unknown;
    from?: { id?: unknown };
    message?: { message_id?: unknown; text?: unknown; chat?: { id?: unknown } };
  };

  if (typeof q.id !== 'string' || typeof q.data !== 'string') return null;
  // Only the owner's own account may decide, whatever chat the button was in.
  if (String(q.from?.id) !== ownerChatId) return null;

  const match = /^(ok|no):([A-Za-z0-9_-]{16})$/.exec(q.data);
  if (!match) return null;

  const chatId = q.message?.chat?.id;
  const messageId = q.message?.message_id;
  return {
    decision: match[1] === 'ok' ? 'paid' : 'rejected',
    orderId: match[2],
    callbackQueryId: q.id,
    chatId: typeof chatId === 'number' || typeof chatId === 'string' ? chatId : null,
    messageId: typeof messageId === 'number' ? messageId : null,
    messageText: typeof q.message?.text === 'string' ? q.message.text : null,
  };
}

export async function answerCallback(
  config: TelegramConfig,
  callbackQueryId: string,
  text: string,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  await call(config, 'answerCallbackQuery', { callback_query_id: callbackQueryId, text }, fetchImpl);
}

/** Replaces the buttons with the outcome so a decision cannot be pressed twice. */
export async function showOutcome(
  config: TelegramConfig,
  d: Decision,
  outcome: string,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  if (d.chatId === null || d.messageId === null) return;
  await call(
    config,
    'editMessageText',
    {
      chat_id: d.chatId,
      message_id: d.messageId,
      text: `${d.messageText ?? ''}\n\n${outcome}`.trim(),
      reply_markup: { inline_keyboard: [] },
    },
    fetchImpl,
  );
}
