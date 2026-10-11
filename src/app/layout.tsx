import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

import { DirectionProvider } from '@/components/ui/direction';
import { localeDirection, type Locale } from '@/i18n/config';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');

  return {
    title: t('title'),
    description: t('description'),
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
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Analytics />
        <SpeedInsights />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>{children}</DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
