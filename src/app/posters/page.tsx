import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { PostersGallery } from '@/features/home/components/PostersGallery';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PostersPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    // the page copy has a line break between its two sentences
    description: t('description').replace(/\s*\n\s*/g, ' '),
    image: SHARE_IMAGES.posters,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/posters',
  });
}

export default function PostersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b1428]" dir="rtl">
      <HomeHeader variant="posters" />
      <main className="flex-1 bg-[#f4f0e7] text-[#172338]">
        <PostersGallery />
      </main>
      <HomeFooter variant="posters" />
    </div>
  );
}
