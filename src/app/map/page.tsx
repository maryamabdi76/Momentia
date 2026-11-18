import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { TreasureMapMaker } from '@/features/treasure-map/components/TreasureMapMaker';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('MapPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.posters,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/map',
  });
}

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <HomeHeader variant="posters" />
      {/* the form's field ids are random, so it is streamed in rather than prerendered */}
      <Suspense fallback={<main className="flex-1" aria-busy="true" />}>
        <TreasureMapMaker />
      </Suspense>
      <HomeFooter variant="create" />
    </div>
  );
}
