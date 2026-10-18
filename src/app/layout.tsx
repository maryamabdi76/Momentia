import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { DirectionProvider } from '@/components/ui/direction';
import { localeDirection, type Locale } from '@/i18n/config';
import { getSiteUrl } from '@/lib/site';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { vazirMatn } from 'next-persian-fonts/vazirmatn';

import './globals.css';
import { clsx } from 'cn';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');

  return {
    // makes the relative share-image and canonical URLs absolute
    metadataBase: getSiteUrl(),
    // the default card; every page below sets its own (see shareMetadata)
    ...shareMetadata({
      title: t('title'),
      description: t('description'),
      image: SHARE_IMAGES.home,
      imageAlt: t('shareImageAlt'),
      siteName: t('title'),
    }),
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className={clsx(
          'min-h-full flex flex-col bg-background font-sans text-foreground',
          vazirMatn.className,
        )}
      >
        <Analytics />
        <SpeedInsights />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>{children}</DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
