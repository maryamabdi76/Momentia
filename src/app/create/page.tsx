import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateStepper } from '@/features/poster/components/CreateStepper';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { SHARE_IMAGES, shareMetadata } from '@/lib/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('CreatePage');
  const tMeta = await getTranslations('Metadata');
  return shareMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: SHARE_IMAGES.create,
    imageAlt: tMeta('shareImageAlt'),
    siteName: tMeta('title'),
    path: '/create',
  });
}

export default function CreatePage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <CreateStepper />
      <HomeFooter variant="create" />
    </div>
  );
}
