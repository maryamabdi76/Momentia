import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GiftView } from '@/features/poster/components/GiftView';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('GiftPage');
  const tMeta = await getTranslations('Metadata');
  return {
    ...shareMetadata({
      title: t('metaTitle'),
      description: t('metaDescription'),
      image: SHARE_IMAGES.home,
      imageAlt: tMeta('shareImageAlt'),
      siteName: tMeta('title'),
      path: '/gift',
    }),
    // every link carries a different private poster; none of them belongs in search
    robots: { index: false, follow: true },
  };
}

export default function GiftPage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <main className="flex-1 px-6 py-12 md:py-16">
        <GiftView />
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
