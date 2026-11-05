export type ShareApp = 'telegram' | 'whatsapp';

/** The address that opens each messenger's "send this" screen with a message and a link. */
export function shareLink(app: ShareApp, text: string, url: string): string {
  if (app === 'telegram') {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }
  // WhatsApp takes one text, so the link goes at the end of it
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}
