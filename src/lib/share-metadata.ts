import type { Metadata } from 'next';

/** The share images in public/og are 1200 × 630, the size Telegram, WhatsApp, X and others show large. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** One image per page; the files live in public/og. */
export const SHARE_IMAGES = {
  home: '/og/home.jpg',
  create: '/og/create.jpg',
  moon: '/og/moon.jpg',
  posters: '/og/posters.jpg',
} as const;

export type ShareInput = {
  title: string;
  description: string;
  /** One of SHARE_IMAGES. Relative; `metadataBase` in the root layout makes it absolute. */
  image: string;
  imageAlt: string;
  siteName: string;
  /** The page's own path, e.g. "/moon". Leave out in the root layout so it is not inherited. */
  path?: string;
};

/**
 * Everything a link preview needs: Open Graph (Telegram, WhatsApp, Facebook,
 * LinkedIn…) and Twitter/X cards. Pages set their own copy; a nested page's
 * `openGraph` replaces its parent's rather than merging, so each page passes the
 * full set through here.
 */
export function shareMetadata({
  title,
  description,
  image,
  imageAlt,
  siteName,
  path,
}: ShareInput): Metadata {
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: 'website',
      siteName,
      locale: 'fa_IR',
      title,
      description,
      ...(path ? { url: path } : {}),
      images: [{ url: image, ...SHARE_IMAGE_SIZE, alt: imageAlt, type: 'image/jpeg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
  };
}
