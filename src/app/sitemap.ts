import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { OCCASION_SLUGS } from '@/features/poster/lib/occasions';

const PATHS = [
  '/',
  '/create',
  '/moon',
  '/map',
  '/posters',
  '/contact',
  '/terms',
  '/privacy',
  '/yalda',
  ...OCCASION_SLUGS.map((slug) => `/occasions/${slug}` as const),
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return PATHS.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
