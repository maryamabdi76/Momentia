import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { PostersGallery } from '@/features/home/components/PostersGallery';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PostersPage');
  return { title: t('metaTitle'), description: t('description') };
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
