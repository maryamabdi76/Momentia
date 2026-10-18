/** Where the site lives when nothing else says so: the production deployment. */
const FALLBACK_SITE_URL = 'https://momentia-iota.vercel.app';

type Env = Record<string, string | undefined>;

/**
 * The public origin of the site, used to turn relative links (share images,
 * canonical URLs) into absolute ones. Link previews in Telegram, WhatsApp and
 * the like only follow absolute URLs.
 *
 *   1. SITE_URL            set it once the site has its own domain
 *   2. VERCEL_URL          on preview deployments, so a preview shows its own images
 *   3. VERCEL_PROJECT_PRODUCTION_URL, then the fallback above
 *   local development uses http://localhost:3000
 */
export function getSiteUrl(env: Env = process.env): URL {
  const pick = (): string => {
    const explicit = env.SITE_URL?.trim();
    if (explicit) return explicit;
    if (env.NODE_ENV === 'development') return 'http://localhost:3000';
    if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
    if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    return FALLBACK_SITE_URL;
  };
  try {
    return new URL(pick());
  } catch {
    return new URL(FALLBACK_SITE_URL); // a mistyped SITE_URL must not take every page down
  }
}
