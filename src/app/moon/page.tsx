import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { MoonCreateStepper } from '@/features/moon/components/MoonCreateStepper';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('MoonPage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.moon,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/moon',
  });
}

export default function MoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]" dir="rtl">
      <HomeHeader variant="create" />
      <MoonCreateStepper />
      <HomeFooter variant="create" />
    </div>
  );
}
