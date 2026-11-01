import { readPaymentConfig } from '@/features/payments/lib/config';
import { decideOrder } from '@/features/payments/lib/store';
import {
  answerCallback,
  parseDecision,
  showOutcome,
  verifyWebhookSecret,
} from '@/features/payments/lib/telegram';

/**
 * Telegram's webhook. Register it once (see the README):
 *   <origin>/api/payments/telegram, with the same secret_token as TELEGRAM_WEBHOOK_SECRET.
 *
 * Only a button press by the owner (TELEGRAM_CHAT_ID) on a submitted order does anything.
 * Telegram re-sends an update until it gets a 200, so only a failure worth retrying
 * (storage down) answers non-200.
 */
export async function POST(request: Request) {
  const config = readPaymentConfig();
  if (!config) return new Response('not configured', { status: 503 });

  if (
    !verifyWebhookSecret(
      request.headers.get('x-telegram-bot-api-secret-token'),
      config.telegram.webhookSecret,
    )
  ) {
    return new Response('invalid secret', { status: 401 });
  }

  const update = await request.json().catch(() => null);
  const d = parseDecision(update, config.telegram.chatId);
  if (!d) return new Response('ignored', { status: 200 });

  let result: Awaited<ReturnType<typeof decideOrder>>;
  try {
    result = await decideOrder(config.store, d.orderId, d.decision);
  } catch (err) {
    console.error('payment decision failed', err);
    return new Response('storage error', { status: 500 });
  }

  const outcome =
    result === 'paid'
      ? '✅ تأیید شد'
      : result === 'rejected'
        ? '❌ رد شد'
        : result === 'already_decided'
          ? 'قبلاً تصمیم گرفته شده'
          : 'این سفارش پیدا نشد (احتمالاً منقضی شده)';

  // The decision is already saved; a failure to update the chat must not make Telegram resend it.
  try {
    await answerCallback(config.telegram, d.callbackQueryId, outcome);
    if (result === 'paid' || result === 'rejected') {
      await showOutcome(config.telegram, d, outcome);
    }
  } catch (err) {
    console.error('telegram reply failed', err);
  }
  return new Response('ok', { status: 200 });
}
