import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { ContactLinks } from '@/features/support/components/ContactLinks';
import { DonateCard } from '@/features/support/components/DonateCard';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ContactPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.home,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/contact',
  });
}

const SECTIONS = [0, 1] as const;

export default async function ContactPage() {
  const t = await getTranslations('ContactPage');

  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 md:py-20">
        <p className="text-xs text-[#CEB47B]">{t('eyebrow')}</p>
        <h1 className="mt-3 whitespace-pre-line text-3xl font-bold text-white">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/60">{t('intro')}</p>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold text-[#E8D9B8]">
            {t('channelsTitle')}
          </h2>
          <ContactLinks />
        </section>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((i) => (
            <section key={i} className="space-y-2">
              <h2 className="text-lg font-semibold text-[#E8D9B8]">
                {t(`sections.${i}.title`)}
              </h2>
              <p className="text-sm leading-8 text-[#AAB6CD]">
                {t(`sections.${i}.body`)}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12">
          <DonateCard />
        </div>
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
