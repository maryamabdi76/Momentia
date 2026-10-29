import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

const PATHS = ['/', '/create', '/moon', '/posters', '/privacy'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return PATHS.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
