// Checks the Telegram side of card-to-card payments and says what to fix.
//
//   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... TELEGRAM_WEBHOOK_SECRET=... \
//   SITE_URL=https://your-domain node scripts/check-telegram.mjs [--send]
//
// Reads nothing from the repository and prints no secret. `--send` also sends a test message.
const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const site = process.env.SITE_URL?.trim().replace(/\/$/, '');

let failed = false;
const ok = (m) => console.log(`✅ ${m}`);
const bad = (m) => {
  failed = true;
  console.log(`❌ ${m}`);
};

async function api(method, body) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    return await res.json();
  } catch {
    return { ok: false, description: 'could not reach api.telegram.org' };
  }
}

if (!token) bad('TELEGRAM_BOT_TOKEN is empty');
if (!chatId || !/^-?\d{1,20}$/.test(chatId)) bad('TELEGRAM_CHAT_ID must be only digits (your numeric id, not @username)');
if (!secret || !/^[A-Za-z0-9_-]{16,256}$/.test(secret)) bad('TELEGRAM_WEBHOOK_SECRET must be 16-256 characters of A-Za-z0-9_-');
if (failed) process.exit(1);

const me = await api('getMe');
if (me.ok) ok(`bot token works (@${me.result.username})`);
else {
  bad(`bot token rejected: ${me.description}. Copy it again from @BotFather.`);
  process.exit(1);
}

const chat = await api('getChat', { chat_id: chatId });
if (chat.ok) ok(`the bot can see chat ${chatId}`);
else bad(`chat ${chatId} not reachable: ${chat.description}. Open the bot in Telegram, press Start, and check the id.`);

if (process.argv.includes('--send')) {
  const sent = await api('sendMessage', { chat_id: chatId, text: '✅ Momentia: test message' });
  if (sent.ok) ok('test message sent; you should see it in Telegram');
  else bad(`sendMessage failed: ${sent.description}`);
}

const hook = await api('getWebhookInfo');
if (hook.ok) {
  const info = hook.result;
  const want = site ? `${site}/api/payments/telegram` : null;
  if (!info.url) bad('no webhook is registered, so ✅ / ❌ buttons do nothing. Run setWebhook (see README).');
  else if (want && info.url !== want) bad(`webhook points to ${info.url}, expected ${want}`);
  else ok(`webhook is ${info.url}`);
  if (info.last_error_message) {
    bad(`Telegram's last webhook error: ${info.last_error_message}. 401/403 usually means a different TELEGRAM_WEBHOOK_SECRET than the one given to setWebhook.`);
  }
  if (info.pending_update_count > 0) console.log(`ℹ️ ${info.pending_update_count} updates are waiting to be delivered`);
}

process.exit(failed ? 1 : 0);
